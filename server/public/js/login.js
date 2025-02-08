const startLogin = () => {
    document.getElementById("loginForm").addEventListener("submit",(event) => {
        fetchData(event)
    })
}

const fetchData = async (event) => {
    event.preventDefault()

    const formData = {
        email: event.target.email.value,
        password: event.target.password.value,
    }
    try {
        const response = await fetch("/api/user/login",  {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) {
            document.getElementById("errorText").innerText = "Error logging in user." 
        } else {
            const data = await response.json();
            if(data.token) {
                localStorage.setItem("token", data.token)
                window.location.href = "/frontPage.html"
                console.log(localStorage)
            }
        }
        
        console.log(localStorage)

    } catch (error) {
        console.log(`Error logging in user, ${error.message}`)
    }

}

document.addEventListener("DOMContentLoaded",startLogin())