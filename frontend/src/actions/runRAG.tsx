"use server"

import { apiUrl } from "@/app/config"

export async function runRAG(query: string) {

    let response: any;

    await fetch(apiUrl + "/get?query=" + encodeURIComponent(query.toString()), {method: "GET"}).then((res) => {
        response = res.json()
    })

    return response
}