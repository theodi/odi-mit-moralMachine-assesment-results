# odi-moralMachine-results

**Moral machine results** is a derrivitive of the adapt-contrib-assessment results component specificically designed to accompany the odi-moralMachine-gmcq component.

It is used to display a single assessment's results in which the odi-moralMachine-gmcq component is used (either once, or more preferably, a number of times). 

You should be familiar with [adapt-contrib-assessment](https://github.com/adaptlearning/adapt-contrib-assessment) prior to using this component

## Installation

Designed to work with the authoring tool, but can be installed stand alone.

## Settings Overview

**Important note: do not put the results component in the same article as the assessment itself**.

The attributes listed below are used in *components.json* to configure **Assessment Results**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-assessmentResults/blob/master/example.json). 

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**\_component** (string): This value must be: `assessmentResults`. (One word with uppercase "R".)

**\_classes** (string): CSS class name(s) to be applied to **Assessment Results**’ containing `div`. The class(es) must be predefined in one of the Less files. Separate multiple classes with a space.

**\_layout** (string): This defines the horizontal position of the component in the block. Values can be `full`, `left` or `right`.

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.

**_assessmentId** (string): This value must match the [`_id` of the assessment](https://github.com/adaptlearning/adapt-contrib-assessment#attributes) for which results should be displayed.

**\_isVisibleBeforeCompletion** (boolean): Determines whether this component will be visible as the learner enters the assessment article or if it will be displayed only after the learner completes all question components. Acceptable values are `true` or `false`. The default is `false`.

**\_setCompletionOn** (string): Can be set to `"inview"` or `"pass"`. A a setting of `"inview"` will cause the component to be marked as completed when it has been viewed regardless of whether or not the assessment was passed, whereas a setting of `"pass"` will cause the component to be set to completed when this component has been viewed **and** the assessment has been passed. This setting can be very useful if you have further content on the page that's hidden by trickle which you don't want the user to be able to access until they have passed the assessment. Default is `"inview"`.

**\_resetType** (string): Valid values are: `"hard"`, `"soft"` and `"inherit"`. Controls whether this component does a 'soft' or 'hard' reset when the corresponding assessment is reset. A 'soft' reset will reset everything except component completion; a 'hard' reset will reset component completion as well, requiring the user to complete this component again. If you want this component to have the same reset behaviour as the corresponding assessment you can leave this property out - or set it to 'inherit'.

**\_retry** (object): Contains values for **button**, **feedback** and **\_routeToAssessment**.

>**button** (string): Text that appears on the retry button.

>**feedback** (string): This text is displayed only when both **\_allowRetry** is `true` and more attempts remain ([configured in adapt-contrib-assessment](https://github.com/adaptlearning/adapt-contrib-assessment#attributes)). It may make use of the following variables: `{{attemptsSpent}}`, `{{attempts}}`, `{{attemptsLeft}}`.  `{{{feedback}}}`, representing the feedback assigned to the appropriate band within this component, is also allowed.

>**\_routeToAssessment** (boolean): Determines whether the user should be redirected back (or scrolled up) to the assessment for another attempt when the retry button is clicked.

**\_completionBody** (string): This text overwrites the standard **body** attribute upon completion of the assessment. It may make use of the following variables: `{{attemptsSpent}}`, `{{attempts}}`, `{{attemptsLeft}}`. The variable `{{{feedback}}}`, representing the feedback assigned to the appropriate band, is also allowed.

>**feedback** (string): This text will be displayed to the learner when the learner's score falls within this band's range. It replaces the `{{{feedback}}}` variable when the variable is used within **\_completionBody**. It may make use of the following varaibales: {{{characters-saved}}}, {{{age-preference}}}, {{{saving-more-lives}}}, {{{gender-preference}}}, {{{save-people-in-car}}}, {{{species-preference}}}, {{{upholding-the-law}}}, {{{social-value-preference}}} and {{{avoid-intervention}}}.

>**\_allowRetry** (boolean): Determines whether the learner will be allowed to reattempt the assessment. If the value is `false`, the learner will not be allowed to retry the assessment regardless of any remaining attempts.

>**\_classes** (string): Classes that will be applied to the containing article if the user's score falls into this band. Allows for custom styling based on the feedback band.

<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

Please see related issues on GitHub