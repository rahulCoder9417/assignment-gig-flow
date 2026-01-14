import { toast } from "sonner"


export function showToast(success: boolean, title: string, description?: string,isHired?: boolean,gigId?: string,navigate?: (path: string) => void) {
  if (isHired && gigId && navigate) {
    toast.success(title, {
      description: "You got hired for this gig. Click to view.",
      duration: 6000,
      className: "cursor-pointer",
      action: {
        label: "View gig",
        onClick: () => navigate(`/gigs/${gigId}`),
      },
    });
    return;
  }
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
