document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('programForm');
    const inputField = document.getElementById('eventName');
    const charCount = document.getElementById('charCount');
    const customSelect = document.querySelector(".custom-select");
    const selectSelected = customSelect.querySelector(".select-selected");
    const selectItems = customSelect.querySelector(".select-items");
    const hiddenInput = document.getElementById("skills");
    const selectedSkills = [];

    form.addEventListener('submit', handleSubmit);
    inputField.addEventListener('input', updateCharCount);
    selectSelected.addEventListener("click", toggleDropdown);
    selectItems.querySelectorAll("div").forEach(item => {
        item.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleItem(this);
        });
    });

    document.addEventListener("click", closeDropdown);

    function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        data.skills = selectedSkills;

        fetch('/EMF', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Program created successfully: ' + JSON.stringify(data.eventData));
            form.reset();
            selectedSkills.length = 0;
            updateSelectedText();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was an error creating the program: ' + error);
        });
    }

    function updateCharCount() {
        const currentLength = inputField.value.length;
        charCount.textContent = `${currentLength}/100 characters`;
    }

    function toggleDropdown(e) {
        e.stopPropagation();
        selectSelected.classList.toggle("select-arrow-active");
        selectItems.classList.toggle("select-hide");
    }

    function toggleItem(item) {
        item.classList.toggle("selected");
        const value = item.getAttribute("data-value");
        const index = selectedSkills.indexOf(value);

        if (index > -1) {
            selectedSkills.splice(index, 1);
        } else {
            selectedSkills.push(value);
        }

        updateSelectedText();
        hiddenInput.value = selectedSkills.join(",");
    }

    function updateSelectedText() {
        selectSelected.textContent = selectedSkills.length === 0 ? "Select Skills" : selectedSkills.join(", ");
    }

    function closeDropdown() {
        selectSelected.classList.remove("select-arrow-active");
        selectItems.classList.add("select-hide");
    }
});