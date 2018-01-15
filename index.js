/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This skill gives the names and details of Patriots Players
 * It supports languages (en-US, en-GB).
 **/
/*jshint esversion: 6 */
/* jshint -W097 */ // don't warn about "use strict"

'use strict';

const Alexa = require('alexa-sdk');
const recipes = require('./recipes');
const request = require('request');
const Math = require('mathjs');

const APP_ID = 'amzn1.ask.skill.8d2828d3-c33a-4614-a321-45fbf9425990'; // (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'Pats Players',
            WELCOME_MESSAGE: "Welcome to %s. I can tell you details on Pats players. Ask, for instance, who is jersey 32",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - #%s.',
            HELP_MESSAGE: "You can ask questions such as who is jersey 44? Who is 83? or just shirt number 21",
            HELP_REPROMPT: "You can say things like who is jersey 12? Who is player 77? Say a jersey number",
            STOP_MESSAGE: 'Sorry I could not help bye!',
            RECIPE_REPEAT_MESSAGE: 'You can ask for another jersey number or say repeat, or just say stop.',
            RECIPE_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know ",
            RECIPE_NOT_FOUND_WITH_ITEM_NAME: 'the player who wears jersey %s, he may nolonger be on the team. ',
            RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME: 'that player. ',
            RECIPE_NOT_FOUND_REPROMPT: 'What other player number can I help with? Say, for example, jersey 87, or say stop',
        },
    },
    'en-US': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'Patriots Players',
        },
    },
    'en-GB': {
        translation: {
            RECIPES: recipes.RECIPE_EN_GB,
            SKILL_NAME: 'US Football Patriots Players',
        },
    },
};

const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'PlayerIntent': function () {
        const itemSlot = this.event.request.intent.slots.Item;
        let itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        const cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), itemName);
        const myRecipes = this.t('RECIPES');
        const recipe = myRecipes[itemName];

        if (recipe) {
            const arrFormat = recipe.split(" ");
            var sWeight = arrFormat[3].split("-");
            var sPosition = "Not Set";
            switch (arrFormat[2]) {
                case 'DB':
                    sPosition = "Defensive Back";
                    break;
                case 'LB':
                    sPosition = "Line Backer";
                    break;
                case 'DL':
                    sPosition = "Defensive Line";
                    break;
                case 'DE':
                    sPosition = "Defensive End";
                    break;
                case 'S':
                    sPosition = "Safety";
                    break;
                case 'SS':
                    sPosition = "Strong Safety";
                    break;
                case 'CB':
                    sPosition = "Corner Back";
                    break;
                case 'QB':
                    sPosition = "Quarter Back";
                    break;
                case 'OL':
                    sPosition = "Offensive Line";
                    break;
                case 'T':
                    sPosition = "Tackle";
                    break;
                case 'OT':
                    sPosition = "Offensive Tackle";
                    break;
                case 'G':
                    sPosition = "Guard";
                    break;
                case 'C':
                    sPosition = "Center";
                    break;
                case 'WR':
                    sPosition = "Wide Receiver";
                    break;
                case 'FB':
                    sPosition = "Full Back";
                    break;
                case 'RB':
                    sPosition = "Running Back";
                    break;
                case 'TE':
                    sPosition = "Tight End";
                    break;

                case 'K':
                    sPosition = "Kicker";
                    break;
                case 'P':
                    sPosition = "Punter";
                    break;
                case 'LS':
                    sPosition = "Long Snapper";
                    break;
                default:
                    sPosition = "Unknown (p) " + arrFormat[2];
                    break;
            }

            var sExp = (arrFormat[6] === "R" ? ",\nhe is a Rookie" : " with " + arrFormat[6] + " years of experience");
            var sImageNum = arrFormat[7];

            //            0      1     2  3   4   5 6  7 8
            // '83':   'Allen, Dwayne TE 6-3 265 27 6 00 Clemson',
            this.attributes.speechOutput = arrFormat[1] + " " + arrFormat[0] + " wears " + itemName + ", " +
                "\nPlays " + sPosition + ",\n" +
                sWeight[0] + " feet " + sWeight[1] + ", " +
                arrFormat[4] + " pounds, aged " + arrFormat[5] + sExp +
                ", out of " + arrFormat[8];

            // To add the URL or code to the screen for DEBUG
            //this.attributes.speechOutput += "\n\u{00A0}\n" + arrFormat[7];

            if (arrFormat[9]) this.attributes.speechOutput += " " + arrFormat[9];
            if (arrFormat[10]) this.attributes.speechOutput += " " + arrFormat[10];

            // SPEECH
            this.attributes.repromptSpeech = this.t('RECIPE_REPEAT_MESSAGE');
            this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);

            // CARD

            // var bImage = 1; // During test these photos show on the Alexa Show, but can't be public
            // if (bImage) { // Which Image
            //     var cardImage = {}; // ===new Object();
            //     var baseImage = 'https://d395i9ljze9h3x.cloudfront.net/req/20171109/images/headshots/';
            //     //               https://d395i9ljze9h3x.cloudfront.net/req/20171109/images/headshots/AlleDw00.jpg

            //     var iLen = arrFormat[0].length; // deal with short last names
            //     if (iLen <= 4) // includes trailing comma e.g. Guy,
            //         baseImage += arrFormat[0].substring(0, Math.min(4, iLen - 1)) + "xxx".substring(0, Math.min(2, 5 - iLen));
            //     else
            //         baseImage += arrFormat[0].substring(0, 4);

            //     baseImage += arrFormat[1].substring(0, 2); // First two of first name

            //     if (sImageNum.length > 2) // If it's a full URL
            //     {
            //         cardImage.smallImageUrl = sImageNum; // see 70 Adam Butler
            //         cardImage.largeImageUrl = sImageNum;
            //     } else // If its just a ref#
            //     {
            //         cardImage.smallImageUrl = baseImage + sImageNum + '.jpg';
            //         cardImage.largeImageUrl = baseImage + sImageNum + '.jpg';
            //     }
            //     this.response.cardRenderer(cardTitle, this.attributes.speechOutput, cardImage);
            // } else // No Image
                this.response.cardRenderer(cardTitle, this.attributes.speechOutput);

            this.emit(':responseReady');
        } else {
            let speechOutput = this.t('RECIPE_NOT_FOUND_MESSAGE');
            const repromptSpeech = this.t('RECIPE_NOT_FOUND_REPROMPT');
            if (itemName) {
                speechOutput += this.t('RECIPE_NOT_FOUND_WITH_ITEM_NAME', itemName);
            } else {
                speechOutput += this.t('RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME');
            }
            speechOutput += repromptSpeech;

            this.attributes.speechOutput = speechOutput;
            this.attributes.repromptSpeech = repromptSpeech;

            this.response.speak(speechOutput).listen(repromptSpeech);
            this.emit(':responseReady');
        }
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("OK, Go Pats");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("Canceled., Bye!");
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};