import { toast } from "sonner"


export function showToast(success: boolean, title: string, description?: string) {
  if (success) {
    toast.success(title, {
      description,
    })
  } else {
    toast.error(title, {
      description,
    })
  }
}
