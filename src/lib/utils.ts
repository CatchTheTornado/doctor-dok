import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ZodError, ZodIssue, string } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


type ErrorWithMessage = {
	message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string'
	)
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
	if (isErrorWithMessage(maybeError)) return maybeError

	try {
		return new Error(JSON.stringify(maybeError))
	} catch {
		// fallback in case there's an error stringifying the maybeError
		// like with circular references for example.
		return new Error(String(maybeError))
	}
}

export function getErrorMessage(error: unknown) {
	return toErrorWithMessage(error).message
}

export function getZedErrorMessage(error: ZodError) {
	return error.errors.map((e:ZodIssue) => e.path[0] + ': ' + e.message).join(', ')
}


export function getCurrentTS(): string {
  return getTS();
}
export function getTS(now = new Date()): string {   
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    return formattedDate;   
}


function getLineNumber(text = '', matches: any) {
    return countLines(text.substr(0, matches.index))
}

function countLines(text = '') {
    return text.split('\n').length
}


const PATTERN = /^([A-Za-z \t]*)```([A-Za-z]*)?\n([\s\S]*?)```([A-Za-z \t]*)*$/gm

export function removeCodeBlocks(text: string) {
  return text.replace(PATTERN, '');
}

export function findCodeBlocks(block: string, singleBlockMode = true) {
  let matches
  let errors = []
  let blocks = []
  while ((matches = PATTERN.exec(block)) !== null) {
    if (matches.index === PATTERN.lastIndex) {
      PATTERN.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [ match, prefix, syntax, content, postFix ] = matches
    const lang = syntax || 'none'
    const lineNumber = getLineNumber(block, matches)
    let hasError = false
    /* // debug
    console.log(`prefix: "${prefix}"`)
    console.log(`postFix: "${postFix}"`)
    console.log('syntax:', lang)
    console.log('Content:')
    console.log(content.trim())
    console.log('───────────────────────')
    /** */

    /* Validate code blocks */
    if (prefix && prefix.match(/\S/)) {
      hasError = true
      errors.push({
        line: lineNumber,
        position: matches.index,
        message: `Prefix "${prefix}" not allowed on line ${lineNumber}. Remove it to fix the code block.`,
        block: match
      })
    }
    if (postFix && postFix.match(/\S/)) {
      hasError = true
      const line = lineNumber + (countLines(match) - 1)
      errors.push({
        line,
        position: matches.index + match.length,
        message: `Postfix "${postFix}" not allowed on line ${line}. Remove it to fix the code block.`,
        block: match
      })
    }

    if (!hasError) {
      blocks.push({
        line: lineNumber,
        position: matches.index,
        syntax: lang,
        block: match,
        code: content.trim()
      })
    }
  }

  if (blocks.length === 0 && singleBlockMode) {
    blocks.push({
        line: 0,
        position:0,
        syntax: '',
        block: '',
        code: block.trim()
      })    
  }

  return {
    errors,
    blocks
  }
}