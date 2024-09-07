import { ConfigContextType } from "@/contexts/config-context";

type PromptTemplateContext = {
    config?: ConfigContextType | null;
}
const promptOptions = [
    'healthy lifestyle (longevity)',
    'sports performance',
    'diabetes risk',
    'the need for supplements',
    'cardiovascular disease risk',
    'cancer risk',
    'hydration levels',
    'hypertension (high blood pressure)',
    'kidney function',
    'liver function',
    'thyroid function',
    'hormone levels',
    'vitamin and mineral levels',
    'inflammation',
    'pregnancy planning',
    'blood system diseases',
    'metabolic and hormonal disorders',
    'infections and infectious diseases'
];

export const promptTemplates = {
    analyzeMyLatestResults: {
        label: "Analyze my latest test results for ...",
        template: (context: PromptTemplateContext) => {
            return "Analyze my latest test results for {select:" + promptOptions.join('|') + "}"
        },
    },
    checkTrends: {
        label: "Check my test results for trends",
        template: (context: PromptTemplateContext) => {
        return "Check my latest test results for {select:" + promptOptions.join('|') + "} and show the trends from previous ones"
        },
    },    
    howCanIImprove: {
        label: "How can I improve based on my test results?",
        template: (context: PromptTemplateContext) => {
            return "How can I improve my latest test results in the area of {select:" + promptOptions.join('|') + "}?"
        },
    },    
    bestNextStep: {
        label: "What should be my best next diagnostic step?",
        template: (context: PromptTemplateContext) => {
            return "What should be my best next diagnostic step for {select:regarding my overal results|" + promptOptions.join('|') + "}?"
        },
    },    

}