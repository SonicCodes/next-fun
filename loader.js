const fs = require('fs-extra');
const path = require("path")
const $matcher = /(?:async\s+)?function\s+\$([A-z0-9]+)?\s*\(([^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*\{((?:[^}{]+|\{(?:[^}{]+|\{[^}{]*\})*\})*)\}/gm


module.exports = function (source, map) {
    var callback = this.async();

    const fun_name_counter = {}
    source=source.replace($matcher,  (match, fun_name, fun_params, fun_code) => {
        const fun_hash = (()=>{
            const res_path = this.resourcePath.replace(/^.+\/pages\//,'').split("/");
            return require("crypto").createHash("sha256").update(res_path.join("_")).digest().toString("hex") + `_${res_path[res_path.length -1 ].replace(".js","")}`
        })()+"_"+fun_name+(((fun_name_counter[fun_name]||0) > 0) ? `_${(fun_name_counter[fun_name]||0)}` : ``)
        const compiled_path = path.resolve("pages", "api", "execute", `${fun_hash}.js`)
        console.log(compiled_path)
        const fun_full_code = `
export default async function ${fun_name}(req,res){
    res.send((await (async function (${fun_params||""}){
        ${fun_code}
    })(...(req.body.params||[])))||{"status":"success"})
}
                                    `
        fs.outputFileSync(compiled_path, fun_full_code)
        fun_name_counter[fun_name] = (fun_name_counter[fun_name]||0) + 1;
        return `async function $${fun_name}(...params){
    let $response = await (await fetch("/api/execute/${fun_hash}", {
        body: JSON.stringify({
        params
        }),
        headers: {
            'Content-Type': "application/json"
            }
        ,method:"POST"
    })).text()
    try{
        $response = JSON.parse($response)
    }catch (e) {
        
    }
    return $response
                                    }`


    })
    callback(null, source, map);
}
