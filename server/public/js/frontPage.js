document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token")
    const logoutBtn = document.getElementById("logout")

    if(!token) {
        window.location.href = "/login.html"
        return
    }
    try {
        const response = await fetch("/api/private", {
            method: "GET",
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
        if (!response.ok) {
            document.getElementById("errorText").textContent = "Error with secret route"
            window.location.href = "/login.html"
            return
        }
        const data = await response.json()
        console.log("Allowed to frontpage", data)

    }   catch (error) {
        console.log("error with access token")
        window.location.href = "/login.html"
    }
    logoutBtn.addEventListener("click", async function (event) {
        localStorage.removeItem("token")
        window.location.href = "/login.html"
    })
})