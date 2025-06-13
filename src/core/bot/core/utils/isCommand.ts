export const isCommand = (text: string | undefined) => {
    return text?.startsWith('/')
}