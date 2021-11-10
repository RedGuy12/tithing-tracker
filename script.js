/* eslint-disable import/unambiguous -- Not ESM */

console.log("***********LOADED***********");

/** @param balances */
function searializeBalances(balances) {
	let searialized;

	if (typeof balances === "string") searialized = JSON.parse(balances);

	if (typeof searialized !== "object" || !searialized)
		searialized = { physical: 0, savings: 0, spending: 0 };

	return {
		physical: +searialized.physical < 0 ? 0 : +searialized.physical,
		savings: +searialized.savings < 0 ? 0 : +searialized.savings,
		spending: +searialized.spending < 0 ? 0 : +searialized.spending,
	};
}

/** @param {{ physical: number; savings: number; spending: number }} balances */
function updateScreen(balances) {
	document.querySelector("#spending-balance").textContent = balances.spending;
	document.querySelector("#savings-balance").textContent = balances.savings;
	document.querySelector("#physical-balance").textContent = balances.physical;
}

/** @param balances */
function createTodos(balances) {
	const TODOS = [],
		totalBalance = balances.physical + balances.savings + balances.spending;
console.log(totalBalance)

	// eslint-disable-next-line one-var -- `needed` depends on `totalBalance`
	const needed = {
		fastOffering: totalBalance * 0.05,
		physical: 0,
		savings: totalBalance * 0.4 - balances.savings,

		spending: totalBalance * 0.45 - balances.spending,

		tithing: totalBalance * 0.1,
	};

	if (needed.savings < 0) {
		TODOS.push({
			amount: needed.savings * -1,
			from: "Savings",
			to: "Spending",
		});
	}

	if (needed.physical) {
		TODOS.push({
			amount: needed.physical,
			from: "Physical",
			to: "Spending",
		});
	}

	if (needed.spending + needed.physical < 0) {
		TODOS.push({
			amount: needed.spending * -1,
			from: "Spending",
			to: "Savings",
		});
	}

	if (needed.fastOffering) {
		TODOS.push({
			amount: needed.fastOffering,
			from: "Spending",
			to: "Fast Offering",
		});
	}

	if (needed.tithing) {
		TODOS.push({
			amount: needed.tithing,
			from: "Spending",
			to: "Tithing",
		});
	}

	return TODOS;
}

/** @param todos */
function showTodos(todos) {
	const todosTable = document.querySelector("#todos");

	todosTable.innerHTML = "";

	for (const todo of todos) {
		const row = document.createElement("tr");

		row.append(
			Object.assign(document.createElement("td"), {
				textContent: todo.from,
			}),
			Object.assign(document.createElement("td"), {
				textContent: todo.to,
			}),
			Object.assign(document.createElement("td"), {
				textContent: todo.amount,
			}),
		);

		todosTable.append(row);
	}
}

/**
 * @param location
 * @param amount
 */
function updateBalance(location, amount) {
	BALANCES[`${location}`] += amount;

	localStorage.setItem("balances", JSON.stringify(BALANCES));
}

/** @type {{ physical: number; savings: number; spending: number }} */
let BALANCES = searializeBalances(localStorage.getItem("balances"));

updateScreen(BALANCES);
showTodos(createTodos(BALANCES));

document.querySelector("#reset").addEventListener("click", (event) => {
	event.preventDefault();

	if (!event.shiftKey && !confirm("Are you sure?")) return;

	BALANCES = searializeBalances({});
	updateScreen(BALANCES);
	showTodos(createTodos(BALANCES));
	localStorage.setItem("balances", JSON.stringify(BALANCES));
});
document.querySelector("#recieve").addEventListener("click", (event) => {
	event.preventDefault();

	const { form } = event.target;

	if (!event.shiftKey && !confirm("Are you sure?")) return;

	const values = Object.fromEntries(
		Array.from(form.elements, (element) => [element.name, element.value]),
	);

	updateBalance(values.location, +values.amount);
	updateScreen(BALANCES);
	showTodos(createTodos(BALANCES));

	form.reset();

	alert("Sent");
});
