"use client"

import { game } from "../config";
import { Page, Document, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { runRAG } from "@/actions/runRAG";
import Loader from "./Loader";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const resizeObserverOptions = {};

export default function App() {

    const [containerRef, __] = useState<HTMLElement | null>(null);

    const [___, setContainerWidth] = useState<number>();

    const [maxWidth, setMaxWidth] = useState<number>(800);

    const [numPages, setNumPages] = useState<number>();

    const [loading, setIsLoading] = useState(false);

    const [query, setQuery] = useState('');

    const [response, setResponse] = useState(null);

    const pageRefs = useRef({});

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
        const [entry] = entries;

        if (entry) {
            setContainerWidth(entry.contentRect.width);
        }
    }, []);

    useResizeObserver(containerRef, resizeObserverOptions, onResize);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    useEffect(() => {
        let width = window.screen.width
        if (width !== null) {
            setMaxWidth(width * 0.5)
        } else {
            setMaxWidth(800)
        }
    })

    const submit = async () => {
        setIsLoading(true)
        setResponse(null)
        const result = await runRAG(query)
        console.log(result)
        setIsLoading(false)
        setResponse(result)
    }
    
    const loadListener = (page: number) => {
        if (page == numPages) {
            console.log("Loaded")
        }
    }

    //@ts-expect-error
    const goToPage = (pageNumber) => {
        //@ts-expect-error
        pageRefs.current[pageNumber].scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div className="overflow-hidden h-screen flex w-full bg-slate-100 dark:bg-gray-900">

            <div className="grid w-1/2 overflow-hidden">
                <div className="flex">
                    <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs mt-5 ml-5" value={query} onChange={e => { setQuery(e.currentTarget.value); }} />
                    <button className="btn btn-outline dark:btn-primary flex justify-center items-center mt-5 ml-5" onClick={submit}>
                        Submit
                        {loading ? <span className="loading loading-spinner"></span> : <div />}
                    </button>
                </div>
                <div>
                    {response !== null ?
                        <div className="overflow-y-auto h-full mt-3 mb-3">
                            <div className="mr-8 ml-8">{
                            //@ts-expect-error
                            response["response"].content}</div>
                            <h3 className="flex justify-center items-center mt-2">Sources:</h3>
                            <div className="flex flex-row justify-center items-center">
                                {
                                    //@ts-expect-error 
                                    <div className="flex justify-center items-center dark:text-primary font-bold cursor-pointer mr-2 ml-2" onClick={() => goToPage(response["document"][0].metadata.page + 1)}>Go To Page {response["document"][0].metadata.page + 1}</div>
                                
                                }
                                <h3 className="flex justify-center items-center dark:text-primary font-bold cursor-pointer mr-2 ml-2" onClick={() => {
                                    //@ts-expect-error
                                    document.getElementById('details').showModal()
                                }}>Show Detailed Sourcing</h3>
                            </div>
                            <dialog id="details" className="modal">
                                <div className="modal-box">
                                    <h1 className="flex justify-center items-center dark:text-primary font-bold">Page {//@ts-expect-error
                                        response["document"][0].metadata.page + 1} Parsed Data</h1>
                                    {
                                        //@ts-expect-error 
                                        <div className="mr-5 ml-5 card bg-base-100 rounded-3xl">"{response["document"][0].page_content}"</div>
                                            
                                    }
                                </div>
                                <form method="dialog" className="modal-backdrop">
                                    <button>Close</button>
                                </form>
                            </dialog>
                        </div>
                        : <div />
                    }
                </div>
            </div>
            <div className="w-1/2 overflow-auto h-screen">
                <Document file={"/pdf/" + game + ".pdf"} onLoadSuccess={onDocumentLoadSuccess} className="overflow-y-scroll rounded-3xl mt-5 mr-3 mb-5" loading={Loader()}>
                    {Array(...Array(numPages))
                        .map((x, i) => i + 1)
                        .map(page => (
                            //@ts-expect-error
                            <div key={page} id={page} ref={el => { pageRefs.current[page] = el; }}>
                                <Page
                                    pageNumber={page}
                                    width={maxWidth}
                                    loading={Loader()}
                                    onRenderSuccess={() => {loadListener(page)}}
                                />
                            </div>
                        ))}
                </Document>
            </div>
        </div>
    )
}