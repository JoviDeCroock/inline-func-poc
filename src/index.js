import esbuild from 'esbuild';
import path from 'path'
import fs from 'fs'

async function main() {
    const resolved = path.resolve('.', 'config.js')
    const filename = `temp-${Date.now()}.js`
    const built = await esbuild.build({
        entryPoints: [resolved],
        outfile: filename,
        write: false,
        platform: 'node',
        bundle: true,
        format: 'esm',
        sourcemap: 'inline',
    })

    const [file] = built.outputFiles;
    await fs.promises.writeFile(file.path, file.text, 'utf-8')
    const { default: result } = await import(`../${filename}`)
    const functionKeys = Object.keys(result.test)

    const builtFunctions = [];
    const depsText = file.text.slice(0, file.text.indexOf('// config.js'))
    for (const funcKey of functionKeys) {
        const funcText = result.test[funcKey].toString()
        const funcName = `${funcKey}-${Date.now() + Math.random()}.js`
        const funcResolved = path.resolve('.', funcName)
        const data = `
            ${depsText}

            export default ${funcText}
        `

        await fs.promises.writeFile(funcResolved, data, 'utf-8')

        const funcResult = await esbuild.build({
            entryPoints: [funcResolved],
            outfile: funcName,
            write: false,
            platform: 'node',
            allowOverwrite: true,
            bundle: true,
            format: 'esm',
            sourcemap: false,
        })
        builtFunctions.push(funcResult.outputFiles[0].text)

        await fs.promises.unlink(funcResolved)
    }

    await fs.promises.unlink(file.path)
    
    console.log(builtFunctions)
    console.log('result', builtFunctions.map(x => x.toString()))
}

main()
