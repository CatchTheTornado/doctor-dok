import { ConfigContextType } from "@/contexts/config-context";

type PromptTemplateContext = {
    config?: ConfigContextType | null;
}
export const promptTemplates = {
    recordParseMultimodal: {
        label: "Check my latest LDL or MCV",
        template: (context: PromptTemplateContext) => {
            return "Check my latest {select:LDL|MCV} blood results and show the trends from previous ones"
        },
    }
}