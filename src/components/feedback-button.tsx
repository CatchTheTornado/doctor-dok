import { Button } from "@/components/ui/button"

export default function FeedbackButton() {
  const handleFeedbackClick = () => {
    // Placeholder for feedback functionality
    window.postMessage({
        target: 'FeaturebaseWidget',
        data: { 
          action: 'changePage', 
          payload: 'CreatePost',  // MainView, RoadmapView, CreatePost, PostsView, ChangelogView
          openWidget: true 
        },
      })
    // You can implement your feedback logic here, such as opening a modal or redirecting to a feedback form
  }

  return (
    <div className="fixed right-[-42px] top-1/2 -translate-y-1/2 rotate-90 transform">
      <Button 
        onClick={handleFeedbackClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-t-lg shadow-lg"
      >
        Feedback / Contact
      </Button>
    </div>
  )
}