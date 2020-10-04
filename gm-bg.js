Hooks.on("renderSceneConfig", (app, html, data) => {
    const gmFlag = app.entity.getFlag("gm-bg", "gm-img");
    const pcFlag = app.entity.getFlag("gm-bg", "pc-img");
    const bg = app.entity.img;
    
    const gmBGHtml = `
    <p class="notes">This shows the background image currently displayed to you. Use the filepicker to set a new DEFAULT background for the scene, which will be shown to players on Save.</p>
    <div class="form-group">
        <label>GM Background Image</label>
        <div class="form-fields">
            <button type="button" class="file-picker" data-type="imagevideo" data-target="flags.gm-bg.gm-img" title="Browse Files" tabindex="-1">
                <i class="fas fa-file-import fa-fw"></i>
            </button>
            <input class="image" type="text" name="flags.gm-bg.gm-img" value="${gmFlag ? gmFlag : bg ? bg : ``}" placeholder="GM Background File Path" data-dtype="String" />
        </div>
    </div>
    <p class="notes">This shows the background image currently displayed to GMs.</p>
    <div class="form-group">
        <label>PC Background Image</label>
        <input class="image" type="text" name="pc-img" placeholder="None" value="${pcFlag ? pcFlag : bg ? bg : ``}" data-dtype="String" disabled />
        <p class="notes">This is the background image currently displayed to players. Change using the Background Image filepicker.</p>
    </div>
    `

    const bgInput = html.find(".image");
    const formGroup = bgInput.closest(".form-group");
    formGroup.after(gmBGHtml);
    const button = html.find('button[data-target="flags.gm-bg.gm-img"]')[0];
    const pcBGInput = html.find('input[name="pc-img"]');

    app._activateFilePicker(button);
    /*
    bgInput.on("change", event => {
        pcBGInput.val(event.target.value);
    });
    */
});

Hooks.on("canvasInit", async canvas => {
    // Non-GM users should always render the default background
    if (!game.user.isGM) {
        return;
    }

    const bg = canvas.scene.data.img;
    const gmFlag = canvas.scene.getFlag("gm-bg", "gm-img");
    const pcFlag = canvas.scene.getFlag("gm-bg", "pc-img")

    // Check that there is a GM background set, and if the scene background doesn't match, swap it out
    if ( gmFlag && bg !== gmFlag) {
  
        canvas.scene.data.img = gmFlag;
        return;
    }
});

Hooks.on("preUpdateScene", (scene, updateData, options, userId) => {
    const bgUpdate = getProperty(updateData, "img");
    //const gmBGUpdate = getProperty(updateData, "flags.gm-bg.gm-img");

    if (!bgUpdate) {
        return;
    }

    //const bg = bgUpdate ? updateData.img : scene.img;
    const pcFlag = canvas.scene.getFlag("gm-bg", "pc-img");

    // If the flag doesn't match the background
    if (pcFlag !== bgUpdate) {
        setProperty(updateData, "flags.gm-bg.pc-img", bgUpdate);
    }
});

Hooks.on("updateScene", (scene, updateData, options, userId) => {
    let changed = new Set(Object.keys(updateData).filter(k => k !== "_id"));

    const redraw = [
        "backgroundColor", "drawings", "gridType", "grid", "gridAlpha", "gridColor", "gridDistance", "gridUnits",
        "shiftX", "shiftY", "width", "height", "img", "tokenVision", "globalLight", "fogExploration",
        "lights", "sounds", "templates", "tiles", "tokens", "walls", "weather"
    ];

    // The scene is already going to redraw, so nothing to do
    if  ( redraw.some(k => changed.has(k))) {
        return;
    }

    const gmFlag = canvas.scene.getFlag("gm-bg", "gm-img");
    const pcFlag = canvas.scene.getFlag("gm-bg", "pc-img"); 
    
    // If I am a GM user and the background does not match the flag, redraw
    // If I am not a GM user and the background does not match the PC flag, redraw
    if ((game.user.isGM && gmFlag && scene.img !== gmFlag) || (!game.user.isGM && pcFlag && scene.img !== pcFlag)) {  
        return canvas.draw();
    }
});