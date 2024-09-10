'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileBarChart, TrendingUp, LineChart, Stethoscope } from "lucide-react"
import { promptTemplates } from "@/data/ai/prompt-templates"
import { useContext } from "react"
import { ChatContext } from "@/contexts/chat-context"
import { ConfigContext } from "@/contexts/config-context"

export function OnboardingChat() {
  const chatContext = useContext(ChatContext);
  const config = useContext(ConfigContext);
  const tiles = [
    {
      icon: <FileBarChart className="h-6 w-6" />,
      text: "Analyze my latest results",
      prompt: promptTemplates.analyzeMyLatestResults,
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      text: "Check my results for trends",
      prompt: promptTemplates.checkTrends,
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      text: "How can I improve ...",
      prompt: promptTemplates.howCanIImprove,
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      text: "Best next diagnostic step?",
      prompt: promptTemplates.bestNextStep,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">How can I assist you today?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((tile, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button
                onClick={() => {
                  chatContext.setPromptTemplate(tile.prompt.template({ config }));
                  chatContext.setChatCustomPromptVisible(false);
                  chatContext.setTemplatePromptVisible(true);
                  chatContext.setChatOpen(true);

                }}
                variant="ghost"
                className="w-full h-full text-left flex items-start space-x-4"
              >
                <div className="flex-shrink-0 text-primary">{tile.icon}</div>
                <div className="flex-grow">
                  <p className="text-lg font-medium">{tile.text}</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}