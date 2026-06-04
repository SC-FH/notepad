/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'html2pdf.js' {
  const html2pdf: () => Html2PdfInstance
  export default html2pdf

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance
    from(element: HTMLElement): Html2PdfInstance
    save(): Promise<void>
  }

  interface Html2PdfOptions {
    margin?: number[]
    filename?: string
    image?: { type: string; quality: number }
    html2canvas?: Record<string, any>
    jsPDF?: Record<string, any>
  }
}
