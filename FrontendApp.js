/*
 * Copyright (c) 2017 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

class FrontendApp {

    constructor(config, connectionConfigFunction) {
        this.config = config;
        this.connectionConfigFunction = connectionConfigFunction;
        this.initConnection();
        this.initUI();
    }

    initUI() {
        $('#exists').click(() => this.exists());
        $('#create').click(() => this.create());
        $('#make-bubbles').click(() => this.makeBubbles());
        $('#turn-on-water-tub').click(() => this.turnOnWaterTub());
        $('#turn-off-water-tub').click(() => this.turnOffWaterTub());
        $('#restFrontend .dismiss-all').click(() => this.dismissAll());
    }

    initConnection() {
        const thingId = this.config.thingId;
        const connectionConfig = this.connectionConfigFunction();

        this.baseUrl = `http://${connectionConfig.getHost()}/api/1/things/${thingId}`;

        const basicAuth = btoa(`${connectionConfig.getUsername()}:${connectionConfig.getPassword()}`);
        $.ajaxSetup({
            headers: {
                Authorization: 'Basic ' + basicAuth,
            }
        });

        this.basicAuthHeader = `Authorization: Basic ${basicAuth}`;
    }

    /* ***************************************************************** */
    /* ********************* UI callbacks ****************************** */
    /* ***************************************************************** */

    turnOnWaterTub() {
        this.initConnection();
        const contentType = 'application/json; charset=utf-8';
        const jsonPayload = JSON.stringify(this.config.waterTub.onPayload);
        const url = `${this.baseUrl}/features/${this.config.waterTub.feature}/inbox/messages/${this.config.waterTub.onSubject}`;

        this.logSend('POST', url, jsonPayload, contentType, 'ask the SmartJacuzzi Thing to turn on its water tub');

        this.sendAsync($.post({
                type: "POST",
                url: url,
                data: jsonPayload,
                contentType: contentType,
            }),
            (data, textStatus, jqXHR) => this.onTurnOnWaterTubSuccess(data, textStatus, jqXHR),
            (jqXHR, textStatus, errorThrown) => this.onTurnOnWaterTubError(jqXHR, textStatus, errorThrown));
    }

    turnOffWaterTub() {
        this.initConnection();

        const contentType = 'application/json; charset=utf-8';
        const jsonPayload = JSON.stringify(this.config.waterTub.offPayload);
        const url = `${this.baseUrl}/features/${this.config.waterTub.feature}/inbox/messages/${this.config.waterTub.offSubject}`;

        this.logSend('POST', url, jsonPayload, contentType, 'ask the SmartJacuzzi Thing to turn on its water tub');

        this.sendAsync($.post({
                type: "POST",
                url: url,
                data: jsonPayload,
                contentType: contentType,
            }),
            (data, textStatus, jqXHR) => this.onTurnOffWaterTubSuccess(data, textStatus, jqXHR),
            (jqXHR, textStatus, errorThrown) => this.onTurnOffWaterTubError(jqXHR, textStatus, errorThrown));
    }

    makeBubbles(captcha = "") {
        this.initConnection();
        const payload = this.config.bubbleMachine.makeBubblesPayload;
        payload.captcha = captcha;

        const contentType = "application/json; charset=utf-8";
        const jsonPayload = JSON.stringify(payload);
        const url = `${this.baseUrl}/inbox/messages/${this.config.bubbleMachine.makeBubblesSubject}`;

        this.logSend('POST', url, jsonPayload, contentType, 'ask the SmartJacuzzi Thing to add bubbles');


        this.sendAsync($.post({
                type: "POST",
                url: url,
                data: jsonPayload,
                contentType: contentType,
            }),
            (data, textStatus, jqXHR) => this.onMakeBubblesSuccess(data, textStatus, jqXHR),
            (jqXHR, textStatus, errorThrown) => this.onMakeBubblesError(jqXHR, textStatus, errorThrown));
    }

    create(onSuccess, onError, thingJson) {
        this.initConnection();
        const payload = JSON.stringify(this.config.thingJson);
        const contentType = "application/json; charset=utf-8";
        this.logSend('PUT', this.baseUrl, payload, contentType, 'tell Ditto to create the twin for the SmartJacuzzi Thing');

        this.sendAsync($.post({
                type: "PUT",
                url: this.baseUrl,
                data: payload,
                contentType: contentType,
            }),
            (data, textStatus, jqXHR) => this.onCreateSuccess(data, textStatus, jqXHR),
            (jqXHR, textStatus, errorThrown) => this.onCreateError(jqXHR, textStatus, errorThrown));
    }

    exists() {
        this.initConnection();
        this.logSend('GET', this.baseUrl, undefined, undefined, 'ask Ditto if the twin for the SmartJacuzzi Thing exists');
        this.sendAsync($.getJSON(this.baseUrl),
            (data, textStatus, jqXHR) => this.onExistsSuccess(data, textStatus, jqXHR),
            (jqXHR, textStatus, errorThrown) => this.onExistsError(jqXHR, textStatus, errorThrown));
    }

    /* ***************************************************************** */
    /* ********************* REST callbacks **************************** */
    /* ***************************************************************** */

    onTurnOnWaterTubSuccess(data, textStatus, jqXHR) {
        this.logToConsole('turn on water tub success');
    }

    onTurnOnWaterTubError(jqXHR, textStatus, errorThrown) {
        this.logToConsole(`turn on water tub error ${jqXHR}`);
    }

    onTurnOffWaterTubSuccess(data, textStatus, jqXHR) {
        this.logToConsole('turn off water tub success');
    }

    onTurnOffWaterTubError(jqXHR, textStatus, errorThrown) {
        this.logToConsole(`turn off water tub error ${jqXHR}`);
    }

    onMakeBubblesSuccess(data, textStatus, jqXHR) {
        this.logToConsole('make jacuzzi success');
    }

    onMakeBubblesError(jqXHR, textStatus, errorThrown) {
        if (this.isCaptchaResponse(jqXHR)) {
            const captcha = this.getCaptchaFromResponse(jqXHR);
            this.solveCaptcha(captcha, (solved) => this.makeBubbles(solved));
        } else {
            this.logToConsole(`make jacuzzi error ${textStatus}`);
        }
    }

    isCaptchaResponse(jqXHR) {
        return isDefined(jqXHR) &&
            isDefined(jqXHR.responseText) &&
            'image/png' === jqXHR.getResponseHeader('content-type');
    }

    getCaptchaFromResponse(jqXHR) {
        return jqXHR.responseText;
    }

    solveCaptcha(captcha, callback) {
        const modal = $("#captchaModal");
        $('#captchaImg').attr('src', captcha);
        $('#captchaSolveButton').click((evt) => {
            const solvedText = $('#captchaSolveText').val();
            // clear captcha text
            $('#captchaSolveText').val('');
            // remove event handlers
            $('#captchaSolveButton').off();
            modal.modal('hide');
            callback(solvedText);
        });
        modal.modal('show');
    }

    onCreateSuccess(data, textStatus, jqXHR) {
        this.logToConsole('create success');
    }

    onCreateError(jqXHR, textStatus, errorThrown) {
        this.logToConsole(`create error ${jqXHR}`);
    }

    onExistsSuccess(data, textStatus, jqXHR) {
        this.showExistsModal('Thing exists', '<p>You can try out the other requests</p>');
    }

    onExistsError(jqXHR, textStatus, errorThrown) {
        this.showExistsModal('Thing does not exist', '<p>Please create the Thing before trying out other requests</p>');
    }

    /* ***************************************************************** */
    /* ***************************************************************** */
    /* ***************************************************************** */

    showExistsModal(title, bodyHtml) {
        $('#existsModal .modal-title').text(title);
        $('#existsModal .modal-body').html(bodyHtml);
        $('#existsModal').modal('show');
    }

    sendAsync(jqXHR, onSuccess, onError) {
        const closureLog = (a, b, c) => this.logResponse(a, b, c);
        jqXHR.fail((jqXHR, textStatus, errorThrown) => {
                onError(jqXHR, textStatus, errorThrown);
                closureLog(textStatus, errorThrown, jqXHR);
            })
            .done((data, textStatus, jqXHR) => {
                onSuccess(data, textStatus, jqXHR);
                closureLog(textStatus, data, jqXHR);
            });
    }


    logSend(type, url, data, contentType, doc) {
        this.logSendToConsole(type, url, data, contentType, doc);
        this.logSendToUI(type, url, data, contentType, doc);
    }

    logSendToConsole(type, url, data, contentType, doc) {
        const curlCmd = `curl --request ${type}
            --url ${url}
            ${isDefined(contentType) ? `     --header 'content-type: ${contentType}'` : ''}
            --header '${this.basicAuthHeader}'
            ${isDefined(data) ? `            --data '${data}'` : ''}`;
        this.logToConsole(curlCmd);
    }

    logSendToUI(type, url, data, contentType, doc) {
        const htmlCmd = `<h4>${type} </h4>
            ${isDefined(data) ? `<p class="break-word">${data}</p>` : ''}
            <hr>
            ${isDefined(contentType) ? `<div><small class="text-muted">${contentType}</small></div>` : ''}
            <div><small class="text-muted">${this.basicAuthHeader}</small></div>
            <div><small class="break-word">${url}</small></div>
            ${isDefined(doc) ? `<div><small class="break-word text-muted">${doc}</small></div>`: ''}`;
        this.logToUi('info', htmlCmd);
    }

    logResponse(statusText, data, jqXHR) {
        const status = jqXHR.status;
        let content = data;
        try {
            content = JSON.stringify(data);
        } catch (err) {
            // do nothing
        }
        this.logResponseToConsole(statusText, content, jqXHR);
        this.logResponseToUI(statusText, content, jqXHR);
    }

    logResponseToConsole(statusText, content, jqXHR) {
        const textResponse = `[${jqXHR.status}] ${isDefined(content) ? content : statusText}`;
        this.logToConsole(textResponse);
    }

    logResponseToUI(statusText, content, jqXHR) {
        const htmlResponse = `<h4>${jqXHR.status} ⇦</h4>
            <div class="break-word">${isDefined(content) ? content : statusText}</div>`;
        this.logToUi('success', htmlResponse);
    }

    logToConsole(message) {
        console.log(`[REST-frontend] ${message}`);
    }

    dismissAll() {
        $("#restFrontend .alert>button").click();
    }

    logToUi(role, message) {
        $("#rf-alerts").append(
            `<div class="alert alert-${role} alert-dismissible fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                    ${message}
             </div>`);
    }

}

isDefined = (arg) => typeof arg !== 'undefined';
