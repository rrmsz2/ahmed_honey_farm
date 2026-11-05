import { Toaster as Sonner, toast } from "sonner"

const Toaster = (props) => (
  <Sonner
    richColors
    closeButton
    position="top-center"
    className="toaster group"
    toastOptions={{ style: { fontFamily: "inherit" } }}
    {...props}
  />
)

export { Toaster, toast }
