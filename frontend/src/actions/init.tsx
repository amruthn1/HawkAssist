"use server"

import { readFile, writeFile } from "node:fs"
import { game, url } from "../app/config"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

export async function init() {
    const session = await getServerSession();
    if (!session || !session.user) {
        redirect("/api/auth/signin")
    } else {
        await readFile("./public/pdf/" + game + ".pdf", (err, data) => {
            if (err && !data) {
                fetch(url).then(async (res) => {
                    const data = await res.arrayBuffer()
                    const buffer = Buffer.from(new Uint8Array(data))
                    await writeFile("./public/pdf/" + game + ".pdf", buffer, (err) => {
                        if (err !== null) {
                            console.error(err)
                        }
                    })
                    return Promise.resolve()
                })
            }
        })
    }
}