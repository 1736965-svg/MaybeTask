const contractForm = document.getElementById("contractForm");
const contractList = document.getElementById("contractList");
const balanceEl = document.getElementById("balance");
const teamBalanceEl = document.getElementById("teamBalance");
const metricContracts = document.getElementById("metricContracts");
const metricBalance = document.getElementById("metricBalance");
const metricCompletion = document.getElementById("metricCompletion");
const ownerSelect = document.getElementById("ownerSelect");
const memberProfiles = document.getElementById("memberProfiles");

const storageKey = "maybetask-data";
const defaultState = {
  teamBalance: 1200,
  members: [
    { id: "alina", name: "Алина", role: "Дизайн" },
    { id: "sergey", name: "Сергей", role: "Продукт" },
    { id: "inna", name: "Инна", role: "Маркетинг" },
  ],
  contracts: [
    {
      title: "Прототип онбординга",
      assigneeId: "sergey",
      requesterId: "alina",
      owner: "Сергей",
      due: "15 марта",
      reward: 180,
      xp: 25,
      status: "В работе",
    },
    {
      title: "План ретроспективы",
      assigneeId: "inna",
      requesterId: "sergey",
      owner: "Инна",
      due: "19 марта",
      reward: 120,
      xp: 15,
      status: "Согласован",
    },
  ],
};

const loadState = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return { ...defaultState };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      teamBalance: Number(parsed.teamBalance) || defaultState.teamBalance,
      members: Array.isArray(parsed.members) ? parsed.members : defaultState.members,
      contracts: Array.isArray(parsed.contracts) ? parsed.contracts : defaultState.contracts,
    };
  } catch (error) {
    return { ...defaultState };
  }
};

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify({ teamBalance, members, contracts }));
};

let { teamBalance, members, contracts } = loadState();

const formatNumber = (value) => value.toLocaleString("ru-RU");

const updateMetrics = () => {
  const completedCount = contracts.filter(
    (contract) => contract.status === "Выполнено вовремя",
  ).length;
  const total = contracts.length || 1;
  const completionRate = Math.round((completedCount / total) * 100);
  metricCompletion.textContent = `${completionRate}%`;
};

const renderBalance = () => {
  balanceEl.textContent = formatNumber(teamBalance);
  teamBalanceEl.textContent = formatNumber(teamBalance + 1150);
  metricBalance.textContent = formatNumber(teamBalance + 780);
  metricContracts.textContent = `${contracts.length + 10}`;
  updateMetrics();
};

const renderContracts = () => {
  contractList.innerHTML = "";
  contracts.forEach((contract, index) => {
    const requester = members.find((member) => member.id === contract.requesterId);
    const item = document.createElement("li");
    item.className = "contract-item";
    item.innerHTML = `
      <div>
        <strong>${contract.title}</strong>
        <div class="contract-meta">
          <span>${contract.owner} · ${contract.due}</span>
          <span>${contract.status}</span>
        </div>
      </div>
      <div class="contract-meta">
        <span>Награда: ${contract.reward} валюты</span>
        <span>Бонус: ${contract.xp} XP</span>
      </div>
      <div class="contract-meta">
        <span>Поставил задачу: ${requester ? requester.name : "Команда"}</span>
      </div>
      <div class="contract-actions">
        <button class="action-button success" data-action="complete" data-index="${index}">
          Завершено вовремя
        </button>
        <button class="action-button" data-action="delay" data-index="${index}">
          Пересогласовать срок
        </button>
      </div>
    `;
    contractList.appendChild(item);
  });
};

const renderOwnerSelect = () => {
  ownerSelect.innerHTML = "";
  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = `${member.name} · ${member.role}`;
    ownerSelect.appendChild(option);
  });
};

const renderMemberProfiles = () => {
  memberProfiles.innerHTML = "";
  members.forEach((member) => {
    const assigned = contracts.filter((contract) => contract.assigneeId === member.id);
    const requested = contracts.filter((contract) => contract.requesterId === member.id);
    const earned = assigned.reduce((sum, contract) => sum + contract.reward, 0);

    const card = document.createElement("article");
    card.className = "panel profile-card";
    card.innerHTML = `
      <div class="profile-header">
        <div>
          <strong>${member.name}</strong>
          <span>${member.role}</span>
        </div>
        <div class="profile-balance">${formatNumber(earned)} валюты</div>
      </div>
      <div class="profile-tags">
        <span class="profile-tag">Активных: ${assigned.length}</span>
        <span class="profile-tag">Поставил: ${requested.length}</span>
      </div>
      <div>
        <strong>Задачи участника</strong>
        <ul class="profile-list">
          ${assigned
            .slice(0, 3)
            .map((contract) => `<li>${contract.title} · ${contract.status}</li>`)
            .join("") || "<li>Пока нет контрактов</li>"}
        </ul>
      </div>
      <div>
        <strong>Поставленные задачи</strong>
        <ul class="profile-list">
          ${requested
            .slice(0, 3)
            .map((contract) => `<li>${contract.title} · ${contract.owner}</li>`)
            .join("") || "<li>Пока нет запросов</li>"}
        </ul>
      </div>
    `;
    memberProfiles.appendChild(card);
  });
};

const addContract = (formData) => {
  const title = formData.get("title").trim();
  const ownerId = formData.get("owner");
  const due = formData.get("due");
  const reward = Number(formData.get("reward"));
  const xp = Number(formData.get("xp"));
  const owner = members.find((member) => member.id === ownerId);

  contracts = [
    {
      title,
      assigneeId: ownerId,
      requesterId: "alina",
      owner: owner ? owner.name : "Неизвестно",
      due: new Date(due).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      }),
      reward,
      xp,
      status: "Ожидает принятия",
    },
    ...contracts,
  ];

  teamBalance += reward;
  saveState();
  renderContracts();
  renderBalance();
  renderMemberProfiles();
};

const updateContractStatus = (index, action) => {
  contracts = contracts.map((contract, idx) => {
    if (idx !== index) {
      return contract;
    }

    if (action === "complete") {
      teamBalance += contract.reward;
      return { ...contract, status: "Выполнено вовремя" };
    }

    return { ...contract, status: "Пересогласование" };
  });

  saveState();
  renderContracts();
  renderBalance();
  renderMemberProfiles();
};

contractForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addContract(new FormData(contractForm));
  contractForm.reset();
});

contractList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const index = Number(button.dataset.index);
  updateContractStatus(index, action);
});

renderContracts();
renderBalance();
renderOwnerSelect();
renderMemberProfiles();
