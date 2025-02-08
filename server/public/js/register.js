const startRegistration = () => {
    document.getElementById("registerForm").addEventListener("submit", (event) => {
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
        const response = await fetch("/api/user/register",  {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) {
            document.getElementById("errorText").innerText = "Error registering user."
        } else {
            window.location.href = "/login.html"
        }

    } catch (error) {
        console.log(`Error registering user, ${error.message}`)
    }

}

document.addEventListener("DOMContentLoaded",startRegistration())