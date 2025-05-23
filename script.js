document.addEventListener("DOMContentLoaded", () => {
  const programForm = document.getElementById("programForm");
  const programIdInput = document.getElementById("programId");
  const nameInput = document.getElementById("name");
  const versionInput = document.getElementById("version");
  const usageInfoInput = document.getElementById("usageInfo");
  const urlInput = document.getElementById("url");
  const addButton = document.getElementById("addButton");
  const updateButton = document.getElementById("updateButton");
  const cancelButton = document.getElementById("cancelButton");
  const programsListDiv = document.getElementById("programsList");
  const searchInput = document.getElementById("searchInput");

  // Referencia a los botones de descarga y subida
  const downloadDataButton = document.getElementById("downloadDataButton");
  const uploadFileInput = document.getElementById("uploadFileInput");
  const uploadDataButton = document.getElementById("uploadDataButton");
  const uploadLabel = document.querySelector(".upload-label");

  let programs = JSON.parse(localStorage.getItem("programs")) || [];
  let editingProgramId = null;

  const generateId = () =>
    "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  const renderPrograms = (programsToRender = programs) => {
    programsListDiv.innerHTML = "";
    if (programsToRender.length === 0) {
      programsListDiv.innerHTML =
        "<p class='text-center text-gray-500 italic'>No hay programas almacenados.</p>";
      return;
    }

    programsToRender.forEach((program) => {
      const programElement = document.createElement("div");
      programElement.classList.add(
        "program-item",
        "bg-white",
        "p-4",
        "rounded-lg",
        "shadow-sm",
        "border",
        "border-gray-200"
      );
      programElement.setAttribute("data-id", program.id);
      programElement.innerHTML = `
                <h3 class="text-xl font-semibold text-blue-600 mb-2">${program.name} (v${program.version})</h3>
                <p class="text-gray-700 mb-1"><strong>Información de Uso:</strong> ${program.usageInfo}</p>
                <p class="text-gray-700 mb-2"><strong>URL:</strong> <a href="${program.url}" target="_blank" class="text-blue-500 hover:underline break-all">${program.url}</a></p>
                <div class="flex justify-end space-x-2 mt-4">
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out" onclick="editProgram('${program.id}')">✏️ Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out" onclick="deleteProgram('${program.id}')">🗑️ Eliminar</button>
                </div>
            `;
      programsListDiv.appendChild(programElement);
    });
  };

  const savePrograms = () => {
    localStorage.setItem("programs", JSON.stringify(programs));
  };

  const resetForm = () => {
    programForm.reset();
    programIdInput.value = "";
    editingProgramId = null;
    addButton.style.display = "inline-block";
    updateButton.style.display = "none";
    cancelButton.style.display = "none";
    nameInput.focus();
  };

  // Manejar envío del formulario (Agregar o Actualizar)
  programForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const version = versionInput.value.trim();
    const usageInfo = usageInfoInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !version || !usageInfo || !url) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (editingProgramId) {
      // Actualizar
      const programIndex = programs.findIndex((p) => p.id === editingProgramId);
      if (programIndex > -1) {
        programs[programIndex] = {
          id: editingProgramId,
          name,
          version,
          usageInfo,
          url,
        };
      }
    } else {
      // Agregar
      const newProgram = {
        id: generateId(),
        name,
        version,
        usageInfo,
        url,
      };
      programs.push(newProgram);
    }

    savePrograms();
    renderPrograms();
    resetForm();
  });

  // Función global para editar programa (accesible desde los botones)
  window.editProgram = (id) => {
    const programToEdit = programs.find((p) => p.id === id);
    if (programToEdit) {
      editingProgramId = id;
      programIdInput.value = programToEdit.id;
      nameInput.value = programToEdit.name;
      versionInput.value = programToEdit.version;
      usageInfoInput.value = programToEdit.usageInfo;
      urlInput.value = programToEdit.url;

      addButton.style.display = "none";
      updateButton.style.display = "inline-block";
      cancelButton.style.display = "inline-block";
      nameInput.focus();
      window.scrollTo(0, 0); // Scroll al inicio para ver el formulario
    }
  };

  // Función global para eliminar programa
  window.deleteProgram = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este programa?")) {
      programs = programs.filter((p) => p.id !== id);
      savePrograms();
      renderPrograms();
      if (editingProgramId === id) {
        resetForm();
      }
    }
  };

  // Cancelar edición
  cancelButton.addEventListener("click", () => {
    resetForm();
  });

  // Búsqueda de programas
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPrograms = programs.filter(
      (program) =>
        program.name.toLowerCase().includes(searchTerm) ||
        program.version.toLowerCase().includes(searchTerm) ||
        program.usageInfo.toLowerCase().includes(searchTerm)
    );
    renderPrograms(filteredPrograms);
  });

  // Función para descargar los datos del localStorage
  const downloadProgramData = () => {
    const dataString = localStorage.getItem("programs");

    if (!dataString || dataString === "[]") {
      alert("No hay programas almacenados para descargar.");
      return;
    }

    let fileName = "programas_almacenados.json";
    let dataToDownload = dataString;
    let mimeType = "application/json";

    try {
      const parsedData = JSON.parse(dataString);
      dataToDownload = JSON.stringify(parsedData, null, 2);
    } catch (error) {
      console.warn(
        "No se pudo formatear el JSON, se descargará el texto plano.",
        error
      );
      fileName = "programas_almacenados.txt";
      mimeType = "text/plain";
    }

    const blob = new Blob([dataToDownload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Event listener para el botón de descarga
  if (downloadDataButton) {
    downloadDataButton.addEventListener("click", downloadProgramData);
  }

  // Lógica para la subida de datos
  let fileToUpload = null;

  // Cuando se selecciona un archivo en el input de tipo file
  uploadFileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      fileToUpload = files[0];
      uploadDataButton.style.display = "inline-block";
      uploadLabel.textContent = `Archivo seleccionado: ${fileToUpload.name}`;
    } else {
      fileToUpload = null;
      uploadDataButton.style.display = "none";
      uploadLabel.textContent = `⬆️ Cargar Datos (JSON)`;
    }
  });

  // Cuando se hace clic en el botón de confirmar carga
  uploadDataButton.addEventListener("click", () => {
    if (!fileToUpload) {
      alert("Por favor, selecciona un archivo JSON para cargar.");
      return;
    }

    if (
      !confirm(
        "¿Estás seguro de que quieres cargar estos datos? Esto sobrescribirá tus programas actuales."
      )
    ) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const uploadedData = JSON.parse(event.target.result);

        if (
          Array.isArray(uploadedData) &&
          uploadedData.every((p) => p.id && p.name && p.version)
        ) {
          programs = uploadedData;
          savePrograms();
          renderPrograms();
          alert("Datos cargados exitosamente.");
          fileToUpload = null;
          uploadDataButton.style.display = "none";
          uploadLabel.textContent = `⬆️ Cargar Datos (JSON)`;
          uploadFileInput.value = "";
        } else {
          alert(
            "El archivo JSON no parece contener datos de programas válidos. Asegúrate de que sea un respaldo generado por esta aplicación."
          );
        }
      } catch (error) {
        alert(
          "Error al procesar el archivo JSON. Asegúrate de que sea un archivo JSON válido."
        );
        console.error("Error al leer o parsear el archivo JSON:", error);
      }
    };

    reader.onerror = (error) => {
      alert("Error al leer el archivo.");
      console.error("Error del FileReader:", error);
    };

    reader.readAsText(fileToUpload);
  });

  // Renderizar programas al cargar la página
  renderPrograms();
});
