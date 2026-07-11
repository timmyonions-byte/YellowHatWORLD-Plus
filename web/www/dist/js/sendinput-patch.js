(function(){
    // Lightweight client-side safeguard to prevent sending malicious/invalid chat payloads
    function sanitizeMessage(text){
        if (!text) return text;
        // remove null bytes and control characters
        text = text.replace(/\0/g, "");
        text = text.replace(/[\u0000-\u001f\u007f]/g, "");
        // trim and cap length
        text = text.trim();
        const MAX_LEN = 500; // adjust if you want a different limit
        if (text.length > MAX_LEN) text = text.slice(0, MAX_LEN);
        return text;
    }

    // Replace the existing sendInput with a safer version. This runs after the original bundle
    // if this file is loaded after app.js (recommended). It is non-destructive and only alters
    // the sendInput function in the browser runtime.
    window.sendInput = function(){
        try {
            var raw = $("#chat_message").val();
            var text = sanitizeMessage(raw);
            $("#chat_message").val("");
            if (!text || text.length === 0) return;

            var youtube = (typeof youtubeParser === 'function') ? youtubeParser(text) : null;
            if (youtube) return void socket.emit("command", { list: ["youtube", youtube] });

            if (text.charAt(0) === '/') {
                var list = text.substring(1).split(" ").map(sanitizeMessage);
                socket.emit("command", { list: list });
            } else {
                socket.emit("talk", { text: text });
            }
        } catch (err) {
            // Log client-side error to console but avoid throwing
            console.error('[sendInput-patch] error sanitizing or sending message', err);
        }
    };

    console.info('[sendInput-patch] installed: client-side sanitization for sendInput()');
})();
