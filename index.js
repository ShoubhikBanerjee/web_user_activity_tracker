import * as rrweb from 'rrweb'
const FingerprintJS = require('@fingerprintjs/fingerprintjs');
const BasicActivityTracker = require('./basic_activity_tracker');


export class UAT_TRACKER {
    constructor() {
        this.fingureprintResult = null;
        this.rrwebFunction = null;
        this.rrwebEvents = [];
        this.fpPromise = FingerprintJS.load()
        const interactionDataString = window.localStorage.getItem('UAT_USER_INTERACTION_LOG');
        if (interactionDataString) {
            try {
                this.rrwebEvents = JSON.parse(interactionDataString);
            } catch (error) {
                console.error('Parsing Error : 02_1');
            }
        }
    }

    start() {
        // Get the visitor identifier when you need it.
        const self = this;
        this.fpPromise
            .then(fp => fp.get())
            .then(result => {
                this.fingureprintResult = {
                    'visitor_id' : result.visitorId,
                    'meta_data' : result.components
                }
            })
        BasicActivityTracker.startActivityTracker();
        this.rrwebFunction = rrweb.record({
            emit(event) {
                self.rrwebEvents.push(event);
                window.localStorage.setItem('UAT_USER_INTERACTION_LOG', JSON.stringify(self.rrwebEvents));
            },
        });
    }

    stop() {
        BasicActivityTracker.stopActivityTracker();
        if (this.rrwebFunction) {
            this.rrwebFunction();
        }
    }

    getTrackingData() {
        const fingureprintData = this.fingureprintResult;
        const activityDataString = window.localStorage.getItem('UAT_USER_ACTIVITY_LOG');
        let activityData = [];
        if (activityDataString) {
            try {
                activityData = JSON.parse(activityDataString);
            } catch (error) {
                console.error('Parsing Error : 01');
            }

        }

        const interactionDataString = window.localStorage.getItem('UAT_USER_INTERACTION_LOG');
        let interactionData = [];
        if (interactionDataString) {
            try {
                interactionData = JSON.parse(interactionDataString);
            } catch (error) {
                console.error('Parsing Error : 02');
            }
        }

        return {
            'fingureprintData' : fingureprintData,
            'activityData' : activityData,
            'interactionData' : interactionData
        }
    }
    reset(){
        this.rrwebEvents = [];
        BasicActivityTracker.resetData();
        try {
            window.localStorage.setItem('UAT_USER_INTERACTION_LOG', JSON.stringify([]));
        } catch (error) {
            console.error('Error in reseting interaction data');
        }
    }
}

