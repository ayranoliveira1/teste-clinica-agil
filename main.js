const fs = require("fs");
const readLine = require("readline");

const readLineInterface = readLine.createInterface({
   input: process.stdin,
   output: process.stdout,
});

let pacientes = [];
let consultas = [];

const DATA_FILE = "data.json";

carregarDados();
menuInicial();

function carregarDados() {
   try {
      const dados = fs.readFileSync(DATA_FILE, "utf8");
      const jsonDados = JSON.parse(dados);
      pacientes = jsonDados.pacientes || [];
      consultas = jsonDados.consultas || [];

      console.log("Dados carregados com sucesso");
   } catch (error) {
      console.log("Nenhum arquivo de dados encontrado");
   }
}

function salvarDados() {
   try {
      const dados = JSON.stringify({ pacientes, consultas });
      fs.writeFileSync(DATA_FILE, dados, "utf8");
      console.log("Dados salvos com sucesso");
   } catch (error) {
      console.log("Erro ao salvar dados: ", error.message);
   }
}

function menuInicial() {
   console.log("------------------------------------------------");
   console.log(
      "Seja bem-vindo(a) a clínica médica consultas ageis! \nEscolha a baixo a opcão que melhor lhe atende: \n1- Cadastrar um novo paciente. \n2- Agendar uma consulta. \n3- Cancelar uma consulta. \n4- Encerrar o programa."
   );
   console.log("------------------------------------------------");

   readLineInterface.question("Escolha uma das opções: ", (opção) => {
      switch (opção) {
         case "1":
            cadastrarPaciente();
            break;
         case "2":
            agendarConsulta();
            break;
         case "3":
            cancelarConsulta();
            break;
         case "4":
            console.log("Salvando dados e encerrando o programa...");
            readLineInterface.close();
            salvarDados();
            break;
         default:
            console.log("Opcão inválida. Por favor, tente novamente.");
            break;
      }
   });
}

function cadastrarPaciente() {
   readLineInterface.question("Digite o nome do paciente: ", (nome) => {
      readLineInterface.question(
         "Digite a telefone do paciente: ",
         (telefone) => {
            // Verificar se o paciente já existe
            const pacienteExistente = pacientes.find(
               (paciente) => paciente.telefone === telefone
            );

            if (pacienteExistente) {
               console.log("Paciente já cadastrado!");
            } else {
               // Cadastrar o paciente
               const paciente = {
                  nome,
                  telefone,
               };
               pacientes.push(paciente);

               console.log("Paciente cadastrado com sucesso.");
               salvarDados();
            }

            menuInicial();
         }
      );
   });
}

function agendarConsulta() {
   // Verificar se existe algum paciente cadastrado na lista de Cadastro
   if (pacientes.length === 0) {
      console.log("Nenhum paciente encontrado na lista de Cadastro.");
      menuInicial();
      return;
   }

   console.log("Agende sua consulta");

   // Listar pacientes
   console.log("Lista de Pacientes: ");
   pacientes.forEach((paciente, index) => {
      console.log(
         `${index + 1}. Nome: ${paciente.nome} - Telefone: ${paciente.telefone}`
      );
   });

   readLineInterface.question(
      "Escolha o numero do paciente para marcar a consulta : ",
      (numeroDoPaciente) => {
         const indexPaciente = parseInt(numeroDoPaciente) - 1;

         if (pacientes[indexPaciente]) {
            readLineInterface.question(
               "Digite a data da consulta (DD/MM/YYYY): ",
               (data) => {
                  readLineInterface.question(
                     "Digite a hora da consulta (HH:MM): ",
                     (hora) => {
                        readLineInterface.question(
                           "Digite a especialidade desejada: ",
                           (especialidade) => {
                              const dataDaConsulta = new Date(
                                 `${data} ${hora}`
                              );
                              const dataAtual = new Date();

                              // Verificar se ja existe uma consulta marcada neste horário
                              if (
                                 consultas.find(
                                    (consulta) =>
                                       consulta.data === data &&
                                       consulta.hora === hora
                                 )
                              ) {
                                 console.log(
                                    "Já existe uma consulta marcada neste Horário."
                                 );
                                 menuInicial();
                                 return;
                              }

                              // Verificar se a data da consulta é posterior a data atual
                              if (dataDaConsulta < dataAtual) {
                                 console.log(
                                    "Este Horário ja passou. Não é possível marcar consultas retroativas."
                                 );
                                 menuInicial();
                                 return;
                              }

                              // Agendar a consulta
                              consultas.push({
                                 paciente: pacientes[indexPaciente].nome,
                                 data: data,
                                 hora: hora,
                                 especialidade,
                              });

                              console.log("Consulta agendada com sucesso.");
                              salvarDados();
                              menuInicial();
                           }
                        );
                     }
                  );
               }
            );
         } else {
            console.log("Paciente não encontrado");
            menuInicial();
         }
      }
   );
}

function cancelarConsulta() {
   // Verificar se existe alguma consulta agendada
   if (consultas.length === 0) {
      console.log("Nenhuma consulta agendada");
      menuInicial();
      return;
   }

   console.log("Cancelar uma consulta: ");

   // Listar consultas
   console.log("Consultas agendadas: ");
   consultas.forEach((consulta, index) => {
      console.log(
         `${index + 1}. Paciente: ${consulta.paciente} - Data: ${
            consulta.data
         } - Especialidade: ${consulta.especialidade}`
      );
   });

   readLineInterface.question(
      "Escolha o numero da consulta que deseja cancelar: ",
      (numeroDaConsulta) => {
         const indexConsulta = parseInt(numeroDaConsulta) - 1;

         if (consultas[indexConsulta]) {
            console.log(
               `Consulta maracada para: ${consultas[indexConsulta].dia}, ${consultas[indexConsulta].hora}, ${consultas[indexConsulta].especialidade} `
            );

            readLineInterface.question(
               "Tem certeza que deseja cancelar esta consulta? (S/N) ",
               (resposta) => {
                  // Cancelar a consulta
                  if (resposta.toLocaleLowerCase() === "s") {
                     consultas.splice(indexConsulta, 1);
                     console.log("Consulta cancelada com sucesso");
                  } else {
                     console.log(
                        "Operação de cancelamento cancelada pelo usuario."
                     );
                     salvarDados();
                  }

                  menuInicial();
               }
            );
         } else {
            console.log("Consulta não encontrada");
            menuInicial();
         }
      }
   );
}

process.on("exit", () => {
   console.log("Programa encerrado.");
   salvarDados();
});

process.on("SIGINT", () => {
   console.log("\nPrograma interrompido pelo usuário.");
   salvarDados();
   process.exit();
});
