// possible themes:
//  - green
//  - amber
//  - red
//  - neutral
export default function Status( {theme, text} : Props){
    let style = "rounded px-2 py-1 ";

    if (theme == "green"){
        style = style + "inline-block text-[#00FF5A] bg-[#00FF5A]/20";
    }
    else if (theme == "amber"){
        style = style + "inline-block text-[#FFD452] bg-[#FFD452]/20";
    }
    else if (theme == "red"){
        style = style + "inline-block text-[#FF1A1A] bg-[#FF5236]/20";
    }
    else if (theme == "neutral"){
        style = style + "inline-block text-white bg-gray-500/20";
    }
    else{
        console.log("Status used with empty theme");
    }
    
    return(
        <p className={style}>{text}</p>
    );
}