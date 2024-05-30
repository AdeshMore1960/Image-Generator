const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "";  // Replace with a secure method

const updateImageCard = (imageDataArray) => {
    // Clear the existing image gallery
    imageGallery.innerHTML = '';

    // Add new image cards
    imageDataArray.forEach((imgObject, index) => {
        const imgCard = document.createElement('div');
        imgCard.classList.add('img-card', 'loading');

        const imgElement = document.createElement('img');
        const downloadBtn = document.createElement('a');
        const downloadIcon = document.createElement('img');

        const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImg;
        downloadBtn.href = aiGeneratedImg;
        downloadBtn.download = `${new Date().getTime()}_${index}.jpg`;
        
        downloadIcon.src = "images/download.svg";
        downloadIcon.alt = "download icon";

        downloadBtn.appendChild(downloadIcon);
        imgCard.appendChild(imgElement);
        imgCard.appendChild(downloadBtn);
        imageGallery.appendChild(imgCard);

        imgElement.onload = () => {
            imgCard.classList.remove("loading");
        };
    });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: parseInt(userImgQuantity),
                size: "512x512",
                response_format: "b64_json"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error.message.includes("Billing hard limit has been reached")) {
                throw new Error("Billing limit reached. Please try again later or upgrade your plan.");
            } else {
                throw new Error(errorData.error.message || "Failed to generate images! Please try again");
            }
        }

        const { data } = await response.json();
        updateImageCard(data);
    } catch (error) {
        console.error("Error generating images:", error);
        alert(error.message);
    }
};

const handleFormSubmission = (e) => {
    e.preventDefault();

    const userPrompt = document.querySelector(".prompt-input").value;
    const userImgQuantity = document.querySelector(".img-quantity").value;

    const imgCardMarkup = Array.from({ length: userImgQuantity }, () =>
        `<div class="img-card loading">
            <img src="images/loader.svg" alt="image">
            <a href="#" class="download-btn">
                <img src="images/download.svg" alt="download icon">
            </a>
        </div>`
    ).join("");

    imageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleFormSubmission);
