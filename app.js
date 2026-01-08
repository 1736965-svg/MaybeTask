const contractForm = document.getElementById("contractForm");
const contractList = document.getElementById("contractList");
const balanceEl = document.getElementById("balance");
const teamBalanceEl = document.getElementById("teamBalance");
const metricContracts = document.getElementById("metricContracts");
const metricBalance = document.getElementById("metricBalance");

let teamBalance = 1200;
let contracts = [
  {
    title: "Прототип онбординга",
    owner: "Сергей",
    due: "15 марта",
    reward: 180,
    xp: 25,
    status: "В работе",
  },
  {
    title: "План ретроспективы",
    owner: "Инна",
    due: "19 марта",
    reward: 120,
    xp: 15,
    status: "Согласован",
  },
];

const formatNumber = (value) => value.toLocaleString("ru-RU");

const renderBalance = () => {
  balanceEl.textContent = formatNumber(teamBalance);
  teamBalanceEl.textContent = formatNumber(teamBalance + 1150);
  metricBalance.textContent = formatNumber(teamBalance + 780);
  metricContracts.textContent = `${contracts.length + 10}`;
};

const renderContracts = () => {
  contractList.innerHTML = "";
  contracts.forEach((contract, index) => {
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

const addContract = (formData) => {
  const title = formData.get("title").trim();
  const owner = formData.get("owner").trim();
  const due = formData.get("due");
  const reward = Number(formData.get("reward"));
  const xp = Number(formData.get("xp"));

  contracts = [
    {
      title,
      owner,
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
  renderContracts();
  renderBalance();
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

  renderContracts();
  renderBalance();
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
