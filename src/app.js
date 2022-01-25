App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadWeb3: async () => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        console.log("Loaded....");
        try {
          await ethereum.enable();
          web3.eth.sendTransaction({
            /* ... */
          });
        } catch (error) {}
      } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        web3.eth.sendTransaction({
          /* ... */
        });
      } else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    });
  },

  loadAccount: async () => {
    App.account = await ethereum.request({
      method: "eth_accounts"
    });
    console.log(App.account);
  },

  loadContract: async () => {
    const todoList = await $.getJSON("Todolist.json");
    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545")
    );
    App.todoList = await App.contracts.TodoList.deployed();
  },

  render: async () => {
    if (App.loading) return;
    App.setLoading(true);
    $("#account").html(App.account);
    await App.renderTasks();
    App.setLoading(false);
  },

  renderTasks: async () => {
    const taskCount = await App.todoList.taskCount();
    const $taskTemplate = $(".taskTemplate");

    for (let i = 1; i <= taskCount; i++) {
      const task = await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];

      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find(".content").html(taskContent);
      $newTaskTemplate
        .find("input")
        .prop("name", taskId)
        .prop("checked", taskCompleted);
      // .on('click', App.toggleCompleted)

      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
      } else {
        $("#taskList").append($newTaskTemplate);
      }

      $newTaskTemplate.show();
    }
  },

  createTask: async () => {
    App.setLoading(true);
    const content = $('#newTask').val()
    await App.todoList.createTask(content, {
      from: App.account
    })
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});