// script.js - Lógica para o Controle de Saídas MRL

document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expensesList = document.getElementById('expenses');
    const totalAmountSpan = document.getElementById('total-amount');
    const totalProfitSpan = document.getElementById('total-profit');
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterDriver = document.getElementById('filter-driver');
    const filterStore = document.getElementById('filter-store');
    const toggleFiltersButton = document.getElementById('toggle-filters');
    const filterSection = document.getElementById('filter-section');
    const whatsappSchedulerNumber = document.getElementById('whatsapp-scheduler-number');
    const whatsappSchedulerMessage = document.getElementById('whatsapp-scheduler-message');
    const whatsappSchedulerSend = document.getElementById('whatsapp-scheduler-send');
    const whatsappMessageButtons = document.querySelectorAll('.whatsapp-scheduler-message-button');
    
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    // --- Funções de Utilidade ---

    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    function calculateTotals(filteredExpenses) {
        const totalPaid = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalReceived = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.received), 0);
        const totalProfit = totalReceived - totalPaid;

        totalAmountSpan.textContent = totalPaid.toFixed(2).replace('.', ',');
        totalProfitSpan.textContent = totalProfit.toFixed(2).replace('.', ',');
        totalProfitSpan.style.color = totalProfit >= 0 ? '#4ade80' : '#f87171'; // Verde para lucro, Vermelho para prejuízo
    }

    function renderExpenses() {
        expensesList.innerHTML = '';
        const filteredExpenses = applyFilters(expenses);
        
        if (filteredExpenses.length === 0) {
            expensesList.innerHTML = '<li style="justify-content: center; color: #a855f7;">Nenhuma saída encontrada.</li>';
        }

        filteredExpenses.forEach(expense => {
            const li = document.createElement('li');
            li.dataset.id = expense.id;
            
            const profit = parseFloat(expense.received) - parseFloat(expense.amount);
            const profitColor = profit >= 0 ? '#4ade80' : '#f87171';

            li.innerHTML = `
                <div><span>Motorista:</span> <span>${expense.driver}</span></div>
                <div><span>Loja:</span> <span>${expense.store}</span></div>
                <div><span>Valor Pago:</span> <span style="color: #f87171;">R$ ${expense.amount.toFixed(2).replace('.', ',')}</span></div>
                <div><span>Valor Recebido:</span> <span style="color: #4ade80;">R$ ${expense.received.toFixed(2).replace('.', ',')}</span></div>
                <div><span>Peso (kg):</span> <span>${expense.weight}</span></div>
                <div><span>Qtd NFs:</span> <span>${expense.nfs}</span></div>
                <div><span>Lucro:</span> <span style="color: ${profitColor}; font-weight: bold;">R$ ${profit.toFixed(2).replace('.', ',')}</span></div>
                <div><span>Data:</span> <span>${new Date(expense.date).toLocaleDateString('pt-BR')}</span></div>
                <button onclick="deleteExpense(${expense.id})"><i class="fa-solid fa-trash-can"></i></button>
            `;
            expensesList.appendChild(li);
        });

        calculateTotals(filteredExpenses);
    }

    function applyFilters(data) {
        let filtered = data;
        
        // Filtro de Data
        const start = filterStartDate.value ? new Date(filterStartDate.value) : null;
        const end = filterEndDate.value ? new Date(filterEndDate.value) : null;
        
        if (start || end) {
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.date);
                if (start && expenseDate < start) return false;
                if (end && expenseDate > end) return false;
                return true;
            });
        }

        // Filtro de Motorista
        if (filterDriver.value) {
            filtered = filtered.filter(expense => expense.driver === filterDriver.value);
        }

        // Filtro de Loja
        if (filterStore.value) {
            filtered = filtered.filter(expense => expense.store === filterStore.value);
        }

        return filtered;
    }

    // --- Event Listeners ---

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newExpense = {
            id: Date.now(),
            driver: document.getElementById('driver-name').value,
            store: document.getElementById('store-name').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            received: parseFloat(document.getElementById('received-amount').value),
            weight: parseFloat(document.getElementById('expense-weight').value),
            nfs: parseInt(document.getElementById('expense-nfs').value),
            date: document.getElementById('expense-date').value,
        };

        expenses.unshift(newExpense); // Adiciona no início
        saveExpenses();
        renderExpenses();
        expenseForm.reset();
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0]; // Reseta a data para hoje
    });

    // Função global para deletar (chamada pelo botão no HTML)
    window.deleteExpense = function(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
    }

    // Filtros
    [filterStartDate, filterEndDate, filterDriver, filterStore].forEach(filter => {
        filter.addEventListener('change', renderExpenses);
    });

    // Menu Hambúrguer
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Botão de Filtros
    toggleFiltersButton.addEventListener('click', () => {
        const isHidden = filterSection.style.display === 'none';
        filterSection.style.display = isHidden ? 'grid' : 'none'; // Usa 'grid' para o layout de filtros
        
        const span = toggleFiltersButton.querySelector('span');
        span.textContent = isHidden ? 'Ocultar Filtros' : 'Exibir Filtros';
    });

    // Agendador de WhatsApp - Botões de Mensagem
    whatsappMessageButtons.forEach(button => {
        button.addEventListener('click', () => {
            whatsappSchedulerMessage.value = button.dataset.message;
        });
    });

    // Agendador de WhatsApp - Enviar
    whatsappSchedulerSend.addEventListener('click', () => {
        const number = whatsappSchedulerNumber.value.replace(/\D/g, ''); // Remove não-dígitos
        const message = encodeURIComponent(whatsappSchedulerMessage.value);
        if (number && message) {
            const url = `https://api.whatsapp.com/send?phone=55${number}&text=${message}`;
            window.open(url, '_blank');
        } else {
            alert('Por favor, preencha o número e a mensagem.');
        }
    });

    // --- Exportação (Placeholder) ---
    document.getElementById('export-excel').addEventListener('click', () => {
        alert('Funcionalidade de Exportar para Excel (XLSX) não implementada neste placeholder.');
    });

    document.getElementById('download-pdf').addEventListener('click', () => {
        alert('Funcionalidade de Exportar para PDF não implementada neste placeholder.');
    });

    // Inicialização
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    renderExpenses();
});
