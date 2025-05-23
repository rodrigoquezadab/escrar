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

  let programs = JSON.parse(localStorage.getItem("programs")) || [];
  let editingProgramId = null;

  // Función para generar ID único (simple timestamp)
  const generateId = () =>
    "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  // Función para renderizar los programas en la lista
  const renderPrograms = (programsToRender = programs) => {
    programsListDiv.innerHTML = "";
    if (programsToRender.length === 0) {
      programsListDiv.innerHTML = "<p>No hay programas almacenados.</p>";
      return;
    }

    programsToRender.forEach((program) => {
      const programElement = document.createElement("div");
      programElement.classList.add("program-item");
      programElement.setAttribute("data-id", program.id);
      programElement.innerHTML = `
                <h3>${program.name} (v${program.version})</h3>
                <p><strong>Información de Uso:</strong> ${program.usageInfo}</p>
                <p><strong>URL:</strong> <a href="${program.url}" target="_blank">${program.url}</a></p>
                <div class="actions">
                    <button class="edit-btn" onclick="editProgram('${program.id}')">✏️ Editar</button>
                    <button class="delete-btn" onclick="deleteProgram('${program.id}')">🗑️ Eliminar</button>
                </div>
            `;
      programsListDiv.appendChild(programElement);
    });
  };

  // Guardar programas en localStorage
  const savePrograms = () => {
    localStorage.setItem("programs", JSON.stringify(programs));
  };

  // Limpiar formulario
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
        // Si se elimina el programa que se está editando
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

  // Renderizar programas al cargar la página
  renderPrograms();
});
