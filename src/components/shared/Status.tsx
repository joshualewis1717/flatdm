// possible themes:
//  - green
//  - amber
//  - red
//  - neutral
export default function Status( {theme, text} : Props){
    let style = "";

    if (theme == "green"){
        style="text-green-900";
    }
    else if (theme == "amber"){
        style="text-amber-900";
    }
    else if (theme == "red"){
        style="text-red-900";
    }
    else if (theme == "neutral"){
        style="text-white-900";
    }
    else{
        console.log("Status used with empty theme");
    }
    
    return(
        <p className={style}>{text}</p>
    );
}