// Imports
import Luamin from "luamin";
import Filesystem from "fs";

// Overrides
let Overrides = `
local _Packd_require = function(key)
    return function(path)
        local Starter = string.find(key,"/[^/]*$")
        local Start = string.sub(key,1,Starter)

        if string.sub(path,1,2) == "./" then
            local Key = Start.. path:sub(3,#path)

            return _Packd[Key.. ".lua"] or _Packd[Key]
        else
            return _Packd[path.. ".lua"] or _Packd[path]
        end
    end
    end

    local require = function(path)
    if string.sub(path,1,2) == "./" then
        return _Packd[string.sub(path,3,#path).. ".lua"] or _Packd[string.sub(path,3,#path)]
    else
        return _Packd[path.. ".lua"] or _Packd[path]
    end
end
`; // Very ugly ;(

// Packr
async function Packr(project,entry,minify) {
    // Config
    let Project = project;
    let Entry = entry;

    // Variables
    let Packed = "local _Packd = {}\n" + Overrides + "\n";

    // Crawl
    async function Crawl(path) {
        let Path = path ? Project + "/" + path : Project;
        let Items = Filesystem.readdirSync(Path);

        for (let i=0;i<Items.length;i++) {
            const Item = Items[i];
            const Directory = Path + "/" + Item;
            const isDirectory = Filesystem.lstatSync(Directory).isDirectory();

            if (isDirectory) {
                if (path) {
                    let ItemPath = Directory;

                    await Crawl(Path.substring(Project.length + 1,Path.length) + "/" + Item);
                } else {
                    await Crawl(Item);
                }
            } else if (!isDirectory & (Item != Entry || path != null)) {
                Packed += `_Packd["${Directory.substring(Project.length + 1,Path.length) + "/" + Item}"] = (function()\n     ${await Filesystem.readFileSync(Directory)}\nend)\n\n`;
            }
        }
    }

    await Crawl();

    Packed += "\nfor k,v in pairs(_Packd) do\n    _Packd[k] = _Packd[k](_Packd_require(k))\nend\n\n";
    Packed += await Filesystem.readFileSync(Project + "/" + Entry);

    if (minify) {
        Packed = Luamin.minify(Packed);
    }

    Packed = "--[[\n    Packed by Packr\n]]--\n\n" + Packed;

    // Write
    Filesystem.writeFileSync("packd.output.lua",Packed);
}

export { Packr }