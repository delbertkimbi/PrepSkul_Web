import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    const emailContent = `
New Contact Form Submission from PrepSkul Website

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject}

Message:
${message}

---
Sent from PrepSkul Contact Form
    `.trim()

    // For now, we'll log it and return success
    console.log("[v0] Contact form submission:", emailContent)

    // TODO: Add email service integration here
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'PrepSkul <noreply@prepskul.com>',
    //   to: 'info@prepskul.com',
    //   subject: `New Contact: ${subject}`,
    //   text: emailContent,
    // })

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 })
  }
}
