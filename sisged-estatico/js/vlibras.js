document.addEventListener("DOMContentLoaded", function () {
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.onload = function () {
        new window.VLibras.Widget(
            "https://vlibras.gov.br/app"
        );
    };

    document.head.appendChild(script);

    const vlibras = document.createElement("div");
    vlibras.setAttribute("vw", "");
    vlibras.classList.add("enabled");

    vlibras.innerHTML = `
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
            <div class="vw-plugin-top-wrapper"></div>
        </div>
    `;

    document.body.appendChild(vlibras);
});
