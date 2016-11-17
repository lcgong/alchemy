import "./questeditor";
import "./questpad.css!";

import "./quest.model";
import {analyzeMarkdownText} from "app/markdown/markdown";
import {makeQuestionSolutionSignature} from "app/markdown/model/question";

angular.module('mainapp').controller('QuestpadCtrl', QuestpadCtrl);
QuestpadCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'QuestModel'];
function QuestpadCtrl($scope, $q, $state, $timeout, util, QuestModel) {
  console.log('QuestpadCtrl', $scope.repos_sn);

  let qpad = this;

  qpad.mode = 'editing';

  $scope.quest_sn = parseInt($state.params['quest_sn']);
  if (isNaN($scope.quest_sn)) {
      $scope.quest_sn = 0; // 0 means it's new.
  }

  let notLoaded = true;

  // TODO 截获离开事件，判断开头和结束的对象状态 angular.equals
  qpad.question = {
    purpose : {
      testing: false,
      exercising: false
    },
    tags : {},
    categories: {},
    saveForLater: null, // if it is labeled, {taggedTime: ..., }
    created_ts: null,
    updated_ts: null,
  };

  qpad.questionText = '';

  // $scope.$watch('qpad.question', question =>{
  //   console.log('qpad.question=%O', question);
  // }, true)

  $scope.$watch('qpad.questionText', text =>{
    console.log('qpad.questionText=%O', text);
  })

  $scope.$watch('qpad.question.saveForLater', saveforlater => {
    if (notLoaded || $scope.quest_sn === 0) {
      return;
    }

    let status =  qpad.question.saveForLater != null;

    QuestModel.setSaveForLater($scope.quest_sn, status).then(function(data) {
      console.log('saveForLater: ', data[0]);
    });

  }, true);

  $scope.$watch('qpad.question.tags', tags => {
    if (notLoaded || $scope.quest_sn === 0) {
      return;
    }

    QuestModel.updateLabels($scope.quest_sn, 'tags', tags).then(function(data) {
      console.log('tags: ', data);
    });
  }, true);

  $scope.$watch('qpad.question.categories', tags => {
    if (notLoaded || $scope.quest_sn === 0) {
      return;
    }

    QuestModel.updateLabels($scope.quest_sn, 'categories', tags).then(function(data) {
      console.log('categories: ', data);
    });
  }, true);


  //------------------
  qpad.save = () => {

    let question = {
      repos_sn: $scope.repos_sn,
      quest_sn: $scope.quest_sn,
      question_style: qpad.question.questionStyle,
      purpose: qpad.question.purpose,
    };

    // 对文本进行最后提交处理，屏蔽答案，仅选取第一个问题等
    let text = qpad.questionText;

    let questions = analyzeMarkdownText(text);
    if (questions.length == 0 || questions[0].tokens.endIndex == -1){
      return; // no available content
    }

    let lines = text.split(/\r?\n/);
    let quest = questions[0];

    lines = lines.slice(quest.textLineRange[0], quest.textLineRange[1])

    question.editing_text  = lines.join('\n');
    question.testing_text  = muteNotes(lines, quest);
    question.blank_signature = makeQuestionSolutionSignature(quest);

    if ($scope.quest_sn === 0) {

      question.saveforlater = qpad.question.saveForLater != null;
      question.tags = Object.keys(qpad.question.tags);
      question.categories = Object.keys(qpad.question.categories);

      QuestModel.create(question).then(function(data) {
        let quest = data[0];
        util.notifySuccess('试题新建成功');
        $state.go('repos.workshop.questpad', {
          repos_sn: quest.repos_sn,
          quest_sn: quest.quest_sn
        });
      });

    } else if ($scope.quest_sn > 0) {

      QuestModel.save(question).then(function(data) {
        util.notifySuccess('试题保存成功');
        let quest = data[0];
        $state.go('repos.workshop.questpad', {
          repos_sn: quest.repos_sn,
          quest_sn: quest.quest_sn
        });
      });
    }
  };


  qpad.open = () => { // 打开
    if ($scope.quest_sn === 0 || $scope.repos_sn === 0) {
      return;
    }

    QuestModel.getQuestion($scope.quest_sn).then(function(data) {

      let item = data[0];
      let question = {
        quest_sn: item['quest_sn'],
        repos_sn: item['repos_sn'],
      };

      question.created_ts   = item['created_ts'];
      question.updated_ts   = item['updated_ts'];

      question.editingText  = item['editing_text'];
      question.testing_text = item['testing_text'];

      question.purpose      = item['purpose'];
      question.questionStyle= item['question_style'];


      question.editingText  = item['editing_text'];
      question.testingText  = item['testing_text'];

      question.saveForLater = item['saveforlater'];

      question.tags = item['tags'];
      question.categories = item['categories'];

      // question.editingText  = item['editing_text'];
      // question.testingText  = item['testing_text'];
      qpad.questionText = item['editing_text'];

      qpad.question = question;

      $timeout(function() {
        notLoaded = false;
      });
    });
  };

  qpad.open();
}


function muteNotes(lines, question) {
  if (!question) {
    return;
  }

  let notesLineRanges = [];

  for (let subquest of question.subquestions) {
    for (let note of subquest.notes) {
      notesLineRanges.push(note.textLineRange);
    }
  }

  for (let note of question.notes) {
    notesLineRanges.push(note.textLineRange);
  }


  lines = [].concat(lines);

  for (range of notesLineRanges) {
    for (let i = range[0]; i < range[1]; i++) {
      lines[i] = '';
    }
  }

  return lines.join('\n');
}
