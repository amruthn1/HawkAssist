"use server"

import { apiUrl } from "@/app/config"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export async function runRAG(query: string) {

    const session = await getServerSession()

    if (!session || !session.user) {
        redirect("/api/auth/signin")
    } else {
        let response: any;

        await fetch(apiUrl + "/get?query=" + encodeURIComponent(query.toString()), { method: "GET" }).then((res) => {
            response = res.json()
        })

        return response
    }
}