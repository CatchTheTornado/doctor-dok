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
            return "Analyze my latest test results for {select:" + promptOptions.join('|') + "}. Provide information sources and links."
        },
    },
    checkTrends: {
        label: "Check my test results for trends",
        template: (context: PromptTemplateContext) => {
        return "Check my latest test results for {select:" + promptOptions.join('|') + "} and show the trends from previous ones. Provide information sources and links."
        },
    },    
    howCanIImprove: {
        label: "How can I improve based on my test results?",
        template: (context: PromptTemplateContext) => {
            return "How can I improve my latest test results in the area of {select:" + promptOptions.join('|') + "}? Provide information sources and links."
        },
    },    
    bestNextStep: {
        label: "What should be my best next diagnostic step?",
        template: (context: PromptTemplateContext) => {
            return "What should be my best next diagnostic step for {select:regarding my overal results|" + promptOptions.join('|') + "}? Provide information sources and links."
        },
    },
    preVisitSummary: {
        label: "Prepare a summary for my next doctor's visit",
        template: (context: PromptTemplateContext) => {
            return "Prepare a summary report for my next doctor's visit. Format it as a report with proper headings, tables with results etc so it could be printed. Summarize results, mark all exceptions of the norms. Include the following: {select:my full test results|all test results - but just a quick summary|last year full test results|last year summary}. Provide information about the result sources (which examination, date)."
        },
    },    

}