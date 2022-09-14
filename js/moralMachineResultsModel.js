define([
  'core/js/adapt',
  'core/js/models/componentModel'
], function(Adapt, ComponentModel) {

  class MoralMachineResultsResultsModel extends ComponentModel {
    
    init(...args) {
      this.set('originalBody', this.get('body'));// save the original body text so we can restore it when the assessment is reset

      this.listenTo(Adapt, {
        'assessments:complete': this.onAssessmentComplete,
        'assessments:reset': this.onAssessmentReset
      });

      super.init(...args);
    }

    /**
     * Checks to see if the assessment was completed in a previous session or not
     */
    checkIfAssessmentComplete() {
      if (!Adapt.assessment || this.get('_assessmentId') === undefined) {
        return;
      }

      const assessmentModel = Adapt.assessment.get(this.get('_assessmentId'));
      if (!assessmentModel || assessmentModel.length === 0) return;

      const state = assessmentModel.getState();
      const isResetOnRevisit = assessmentModel.get('_assessment')._isResetOnRevisit;
      if (state.isComplete && (!state.allowResetIfPassed || !isResetOnRevisit)) {
        this.onAssessmentComplete(state,assessmentModel);
        return;
      }
      this.setVisibility();
    }
   
    initScoring(scoreObj,counts,multiplier) {
      for (let j =0; j < scoreObj.length; j++) {
        if (scoreObj[j].choices == "Avoid Intervention") {
          counts["Intervene"] = (counts["Intervene"] || 0) + (1 * multiplier);
        }
        if (scoreObj[j].choices == "Save people in car") {
          counts["Save pedestrians"] = (counts["Save pedestrians"] || 0) + (1 * multiplier);
        }
        if (scoreObj[j].choices == "Uphold law") {
          counts["Disobey law"] = (counts["Disobey law"] || 0) + (1 * multiplier);
        }
        if (scoreObj[j].choices == "Save pets") {
          counts["Save humans"] = (counts["Save humans"] || 0) + (1 * multiplier);
        }
        if (scoreObj[j].choices == "Save more people") {
          counts["Save less people"] = (counts["Save less people"] || 0) + (1 * multiplier);
        }
        if (scoreObj[j].choices == "Save robbers") {
          counts["Save professionals"] = (counts["Save professionals"] || 0) + (1 * multiplier);
        }
        if (scoreObj[j].choices == "Save old") {
          counts["Save young"] = (counts["Save young"] || 0) + (1 * multiplier);
        }
      }
      return counts;
    }

    updateScoring(scoreObj,counts,multiplier) {

      let arr = [];

      for(let i = 0; i < scoreObj.length; i++) {
       arr.push(scoreObj[i].choices)
      }

      arr.forEach((x) => {
        counts[x] = (counts[x] || 0) + (1 * multiplier);
        if (x == "Avoid Intervention") { 
         counts["Intervene"] = counts["Intervene"] - (1 * multiplier);
        }
        if (x == "Save people in car") {
          counts["Save pedestrians"] = counts["Save pedestrians"] - (1 * multiplier);
        }
        if (x == "Uphold law") {
          counts["Disobey law"] = counts["Disobey law"] - (1 * multiplier);
        }
        if (x == "Save pets") {
          counts["Save humans"] = counts["Save humans"] - (1 * multiplier);
        }
        if (x == "Save more people") {
          counts["Save less people"] = counts["Save less people"] - (1 * multiplier);
        }
        if (x == "Save robbers") {
          counts["Save professionals"] = counts["Save professionals"] - (1 * multiplier);
        }
        if (x == "Save old") {
          counts["Save young"] = counts["Save young"] - (1 * multiplier);
        }
      })

       return counts;
    }
    async getDataFromXAPI(componentID) {
      var xapiQueryEndpoint = Adapt.config.get('_xapi')._queryURL;
      var xapiQueryEndpoint = "https://learning-locker-api.herokuapp.com/"
      var activityID = Adapt.config.get('_xapi')._activityID;
      var componentURI = encodeURIComponent(activityID + "#/id/" + componentID);

      var dataURL = xapiQueryEndpoint + "?activity=" + componentURI;
      const fetchJson = async () => {
        const response = await fetch(dataURL)
        const json = await response.json()
        return json
      }
      return await fetchJson();
    }

    async getOtherCounts(assessmentModel) {
      let othersCounts = {};
      assessmentModel._getAllQuestionComponents().forEach(async (component) => {
        var responses = []
        if (Adapt.config.get('_xapi')._isEnabled) {
          console.log("Attempting to get data");
          var data = await this.getDataFromXAPI(component.get("_id"));
          responses = data.responses || null;
        }
        
        var totalResponses = 0;
        responses.map(response => {
          totalResponses += response.count;
        });
        
        for(let i = 0; i < 2; i++) {
          var item = component.getChildren().models[i].attributes.scoring;
          othersCounts = this.initScoring(item,othersCounts,totalResponses);
        }
          //Prepare othersCounts to match the scoring counts so far.
        
        responses.map(response => {
            var id = response.id;
            var multiplier = response.count;
            var scoreObj = component.getChildren().models[id-1].attributes.scoring;
            othersCounts = this.updateScoring(scoreObj,othersCounts,multiplier);
        });
      });
      return othersCounts;
    }

    async onAssessmentComplete(state, assessmentModel) {
      if (this.get('_assessmentId') === undefined ||
          this.get('_assessmentId') !== state.id) return;
          
      let 
        // counting choices
        counts = {},
        //  most killed + most saved set up
        othersCounts = await this.getOtherCounts(assessmentModel),
        savedCount = {},
        allCharacterCount = {},
        finalArr = [],
        mostKilled,
        mostSaved;
              
      // view()
      // TODO: Jack this is the new bit and the only real difference so far from the vanilla AssessmentResults component. It might not even belong here but it gives you an idea.

      assessmentModel._getAllQuestionComponents().forEach(component => {
        for(let i = 0; i < 2; i++) {
          var item = component.getChildren().models[i].attributes.scoring;
          counts = this.initScoring(item,counts,1);
        }
        
        // Get and process the active item. 
        let scoreObj = {};
        //Build the array that you need to render the results (the graphical thing)       
        try {
          scoreObj = component.getActiveItems()[0].attributes.scoring;
          counts = this.updateScoring(scoreObj,counts,1);
        } catch (error) {
          return;
        }

        //Most killed + most saved 
        let killedLength = component.getActiveItems()[0].attributes["killed characters"].length
        let savedLength = component.getActiveItems()[0].attributes["saved characters"].length
      
        function getCharacterCounts(activeItem) {
          var saved = activeItem.attributes["saved characters"];
          for(let i=0;i<saved.length;i++) {
            var Character = saved[i]["character"];
            var count = saved[i]["number"];
            allCharacterCount[Character] = (allCharacterCount[Character] || 0) + count;
          }
          var killed = activeItem.attributes["killed characters"];
          for(let i=0;i<killed.length;i++) {
            var Character = killed[i]["character"];
            var count = killed[i]["number"];
            allCharacterCount[Character] = (allCharacterCount[Character] || 0) + count;
          }
          return allCharacterCount;
        }

        function getSavedCounts(activeItem) {
          var saved = activeItem.attributes["saved characters"];
          for(let i=0;i<saved.length;i++) {
            var Character = saved[i]["character"];
            var count = saved[i]["number"];
            var gender = Character.split(" ")[0];
            counts[gender] = (counts[gender] || 0) + count;
            savedCount[Character] = (savedCount[Character] || 0) + count;
          }
          return savedCount;
        }

        allCharacterCount = getCharacterCounts(component.getActiveItems()[0]);
        savedCount = getSavedCounts(component.getActiveItems()[0]);    
        finalArr.push([savedCount, allCharacterCount, counts, othersCounts]);
      });

      let keys = {};
      let values = {};

      try {
        keys = Object.values(finalArr[0][2])
        values = Object.keys(finalArr[0][2])
      } catch(error) {
        console.log(error);
        return;
      }

      let results = {
        counts: finalArr[0][2],
        othersCounts: finalArr[0][3],
        savedCount: finalArr[0][0],
        allCharacterCount: finalArr[0][1],
        keys: keys,
        values: values
      }

      this.setResults(results)

      /*
      make shortcuts to some of the key properties in the state object so that
      content developers can just use {{attemptsLeft}} in json instead of {{state.attemptsLeft}}
      */
      this.set({
        _state: state,
        attempts: state.attempts,
        attemptsSpent: state.attemptsSpent,
        attemptsLeft: state.attemptsLeft,
        score: state.counts,
        scoreAsPercent: state.scoreAsPercent,
        maxScore: state.maxScore,
        isPass: state.isPass,
        results: results
      });

      this.checkRetryEnabled(state);

      this.setFeedbackText(this.getFeedbackText(results));

      this.toggleVisibility(true);

    }

    getResults(){
      return this.results;
    }

    setResults(object) {
      this.results = object;
      
    }

    checkRetryEnabled(state) {
      const assessmentModel = Adapt.assessment.get(state.id);
      if (!assessmentModel.canResetInPage()) return false;

      const isRetryEnabled = true;
      const isAttemptsLeft = (state.attemptsLeft > 0 || state.attemptsLeft === 'infinite');
      const showRetry = isRetryEnabled && isAttemptsLeft;

      this.set({
        _isRetryEnabled: showRetry,
        retryFeedback: showRetry ? this.get('_retry').feedback : ''
      });
    }

    setFeedbackText(outputs) {

      /*Template example
      <div class="moralMachineResults__container"><div id="top">{{{preference}}}</div><div  id="main">{{{save-people-in-car}}} {{{avoid-intervention}}}</div></div>
      */

      var template = Handlebars.compile(this.get('_feedbackTemplate'));
      var feedback = template(outputs);
      this.set({
        feedback,
        body: this.get('_completionBody')
      });
    }

    getUserAnswersTemplate() {
      // Set results template
      let userAnswers = {
        "age-preference": {
          "Save old": 0,
          "Save young": 0,
        },
        "saving-more-lives": {
          "Save less people": 0,
          "Save more people": 0,
        },
        "gender-preference": {
          "Female": 0,
          "Male": 0,
        },
        "save-people-in-car": {
          "Save people in car": 0,
          "Save pedestrians": 0,
        },
        "species-preference": {
          "Save humans": 0,
          "Save pets": 0,
        },
        "upholding-the-law": {
          "Uphold law": 0,
          "Disobey law": 0,
        },
        "social-value-preference": {
          "Save professionals": 0,
          "Save robbers": 0,
        },
        "avoid-intervention": {
         "Avoid Intervention": 0,
         "Intervene": 0,
        },
      };
      return userAnswers;
    }

    nestedToUnestedChanges(counts,userAnswers) {
      //Populate the userAnswers object
      console.log("Input");
      console.log(counts);
      console.log(userAnswers);
      if (counts == undefined) {
        return;
      } else {
        // loop on the changingObj
        for (const [key1, value] of Object.entries(counts)) {
          // loop on the first obj for every entry of the changing obj
          for (const [key2, _] of Object.entries(userAnswers)) {
            // checking if the obj has a property of the changing obj's key
            if (userAnswers[key2].hasOwnProperty(key1)) {
              // adding the value
              userAnswers[key2][key1] += value;
            }
          }
        }
      }
      console.log("User userAnswers");
      console.log(userAnswers);
      return userAnswers;
    }

    removeZeroValues(userAnswers) {
      // Remove user answers where there is no data (zero as the value)
      
      const keys = Object.keys(userAnswers);
      const values = Object.values(userAnswers);

      keys.map((key) => {
        const property = userAnswers[key];
        const propertyKeys = Object.keys(userAnswers[key]);
      });

      const finalObj = {};

      keys.forEach((key) => {
        const property = userAnswers[key];
        const propertyKeys = Object.keys(property);
        const hasNonZeroEntries = propertyKeys.some(
          (propertyKey) => property[propertyKey] !== 0
        );

        if (hasNonZeroEntries) {
              finalObj[key] = userAnswers[key];
          }
      });

      return finalObj;
    }

    getBarPosition(values) {
      var total = 0;
      var firstValue = null;
      for (let key in values) {
       total += values[key];
       if (!firstValue) {
        firstValue = values[key];
       }
      }
      var totalPercent = 100 / total;
      var newCountOne = firstValue * totalPercent;
      return newCountOne;
    }

    getFeedbackText(results) {
      let outputs = {};
      let userAnswers = this.getUserAnswersTemplate();
      let othersAnswers = this.getUserAnswersTemplate();
      try {
        userAnswers = this.nestedToUnestedChanges(results.counts,userAnswers);
        othersAnswers = this.nestedToUnestedChanges(results.othersCounts,othersAnswers);
      } catch (error) {
        console.log(error);
      }
      userAnswers = this.removeZeroValues(userAnswers);
      othersAnswers = this.removeZeroValues(othersAnswers);

      var savedTableDetail = "";
      var percentages = [];
      
      Object.keys(results["allCharacterCount"]).forEach(character => {
        let total = results["allCharacterCount"][character];
        let saved = results.savedCount[character] || 0;
        percentages.push([character,(saved/total || 0)]);
      });

      percentages.sort(function(a, b) {
        return b[1] - a[1];
      });
      
      percentages.forEach(function(item) {
        let character = item[0];
        let total = results["allCharacterCount"][character];
        let saved = results.savedCount[character] || 0;
        if (character.split(" ")[0] == "Pet") {
          savedTableDetail += "<td><img class='pet-summary' src='assets/character/" + character.replaceAll(" ","_") + ".png'></img><br/>" + saved + "/" + total + "</td>"  
        } else {
          savedTableDetail += "<td><img class='character-summary' src='assets/character/" + character.replaceAll(" ","_") + ".png'></img><br/>" + saved + "/" + total + "</td>"
        }
      });
        
      outputs["characters-saved"] = 
      `
      <sub-section id="mostSaved" class="characters">
        <h3>Saved characters / Total</h3>
        <table id="Characters">
          <tr>
          ${savedTableDetail}
          </tr>
        </table>
      </sub-section>
      `;

      //Place we now need to handle the userAnser and the answer of others.

      let keysForView;
      let arrForBar = [];
      let valuesForBar = [];
      let barPositions = {};

      if (userAnswers.length === 0) {
        return;
      } else {
        keysForView = Object.keys(userAnswers);
        Object.keys(userAnswers).map((key) => {
          barPositions[key] = { 
            "user": this.getBarPosition(userAnswers[key]),
            "others": this.getBarPosition(othersAnswers[key])
           };
        })
      }
      console.log("Bar positions");
      console.log(barPositions);
      
      var index = 0;
      var offsets = {};
      for (let key in barPositions) {
        outputs[key] = `
          <sub-section id="question-${key}">
            <h3>${key.replaceAll("-", " ")}</h3>
            <panel>
              <left><img class="results-img" src="./assets/${key}_left.svg"/></left>
              <canvas id="canvas-${key}" height="60" width="300">
              </canvas>
              <right><img class="results-img" src="./assets/${key}_right.svg"/></right>
            </panel>
          </sub-section>
          <script>
            if (typeof ctxArray === "undefined") {
              var ctxArray = [];
            }
            ctxArray["${key}"] = []
            ctxArray["${key}"]["ctx"] = document.getElementById("canvas-${key}").getContext("2d");
            ctxArray["${key}"]["c"] = document.getElementById("canvas-${key}");
            drawTemplate(ctxArray["${key}"]["c"],ctxArray["${key}"]["ctx"]);
            drawLine(ctxArray["${key}"]["c"],ctxArray["${key}"]["ctx"],${barPositions[key]["user"]},"You","top");
            drawLine(ctxArray["${key}"]["c"],ctxArray["${key}"]["ctx"],${barPositions[key]["others"]},"Others","bottom");
          </script>
        `;
        index++;
      };

      return outputs;
    }


    setVisibility() {
      if (!Adapt.assessment) return;

      const assessmentModel = Adapt.assessment.get(this.get('_assessmentId'));
      if (!assessmentModel || assessmentModel.length === 0) return;

      const state = assessmentModel.getState();
      const isAttemptInProgress = state.attemptInProgress;
      const isComplete = !isAttemptInProgress && state.isComplete;
      const isVisibleBeforeCompletion = this.get('_isVisibleBeforeCompletion') || false;
      const isVisible = isVisibleBeforeCompletion || isComplete;

      this.toggleVisibility(isVisible);
    }

    toggleVisibility (isVisible) {
      if (isVisible === undefined) {
        isVisible = !this.get('_isVisible');
      }

      this.set('_isVisible', isVisible, { pluginName: 'assessmentResults' });
    }

    checkCompletion() {
      if (this.get('_setCompletionOn') === 'pass' && !this.get('isPass')) {
        return;
      }

      this.setCompletionStatus();
      
    }

    /**
     * Handles resetting the component whenever its corresponding assessment is reset
     * The component can either inherit the assessment's reset type or define its own
     */
    onAssessmentReset(state) {
      if (this.get('_assessmentId') === undefined ||
          this.get('_assessmentId') !== state.id) return;

      let resetType = this.get('_resetType');
      if (!resetType || resetType === 'inherit') {
        resetType = state.resetType || 'hard';// backwards compatibility - state.resetType was only added in assessment v2.3.0
      }
      this.reset(resetType, true);
    }

    reset(...args) {
      this.set({
        body: this.get('originalBody'),
        state: null,
        feedback: '',
        retryFeedback: '',
        _isRetryEnabled: false
      });

      super.reset(...args);
    }
  }

  return MoralMachineResultsResultsModel;

});
