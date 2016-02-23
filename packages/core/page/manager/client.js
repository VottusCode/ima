// @client-side

import ns from 'ima/namespace';
import AbstractPageManager from 'ima/abstract/pageManager';

ns.namespace('Ima.Page.Manager');

/**
 * Page manager for controller on the client side.
 *
 * @class Client
 * @implements Ima.Abstract.PageManager
 * @namespace Ima.Page.Manager
 * @module Ima
 * @submodule Ima.Page
 */
export default class Client extends AbstractPageManager {

	/**
	 * @method constructor
	 * @constructor
	 * @param {Ima.Page.Factory} pageFactory
	 * @param {Ima.Page.Renderer.PageRenderer} pageRender
	 * @param {Ima.Page.State.PageStateManager} stateManager
	 * @param {Ima.Window.Window} window
	 * @param {Ima.Event.EventBus} eventBus
	 */
	constructor(pageFactory, pageRender, stateManager, window, eventBus) {
		super(pageFactory, pageRender, stateManager);

		/**
		 * @private
		 * @property _window
		 * @type {Ima.Window.Window}
		 * @default window
		 */
		this._window = window;

		/**
		 * @private
		 * @property _eventBus
		 * @type {Ima.Event.EventBus}
		 * @default eventBus
		 */
		this._eventBus = eventBus;

		/**
		 * Binded custom event handler.
		 *
		 * @property _boundOnCustomEventHandler
		 * @type {function}
		 */
		this._boundOnCustomEventHandler = (e) => this._onCustomEventHandler(e);
	}

	/**
	 * @inheritdoc
	 * @method init
	 */
	init() {
		super.init();
		this._eventBus.listenAll(
			this._window.getWindow(),
			this._boundOnCustomEventHandler
		);
	}

	/**
	 * @inheritdoc
	 * @method manage
	 */
	manage(controller, view, options, params = {}) {
		return (
			super
				.manage(controller, view, options, params)
				.then((response) => {
					this._activatePageSource();

					return response;
				})
		);
	}

	/**
	 * @inheritdoc
	 * @method scrollTo
	 */
	scrollTo(x = 0, y = 0) {
		setTimeout(() => {
			this._window.scrollTo(x, y);
		}, 0);
	}

	/**
	 * @inheritdoc
	 * @method destroy
	 */
	destroy() {
		super.destroy();

		this._eventBus.unlistenAll(
			this._window.getWindow(),
			this._boundOnCustomEventHandler
		);
	}

	/**
	 * On custom event handler.
	 *
	 * It calls listener in the active controller. Name of listener is defined
	 * by prefix 'on' and event name. If event name is 'toggle', listener
	 * should be 'onToggle'.
	 *
	 * @private
	 * @method _onCustomEventHandler
	 * @param {CustomEvent} event
	 */
	_onCustomEventHandler(event) {
		var { method, data, eventName } = this._parseCustomEvent(event);
		var controllerInstance = this._managedPage.controllerInstance;

		if (controllerInstance) {
			var handled = this._handleEventWithController(method, data);

			if (!handled) {
				handled = this._handleEventWithExtensions(method, data);
			}

			if ($Debug) {
				if (!handled) {
					console.warn(`The active controller has no listener for ` +
							`the encountered event '${eventName}'. Check ` +
							`your event name for typos, or create an ` +
							`'${method}' event listener method on the ` +
							`active controller or add an event listener ` +
							`that stops the propagation of this event to ` +
							`an ancestor component of the component that ` +
							`fired this event.`);
				}
			}
		}
	}

	/**
	 * Return parsed custom event as object with keys method, data and
	 * eventName.
	 *
	 * @private
	 * @method _parseCustomEvent
	 * @param {CustomEvent} event
	 * @return {Object<string, *>}	The parsed custom event.
	 */
	_parseCustomEvent(event) {
		var eventName = event.detail.eventName;
		var method = 'on' + eventName.charAt(0).toUpperCase() +
				eventName.slice(1);
		var data = event.detail.data;

		return { method, data, eventName };
	}

	/**
	 * Try handle event with controller. If event is handled by
	 * controller then return true else return false.
	 *
	 * @private
	 * @method _handleEventWithController
	 * @param {string} method
	 * @param {Object<string, *>} data
	 * @return {boolean}
	 */
	_handleEventWithController(method, data) {
		var controllerInstance = this._managedPage.controllerInstance;

		if (typeof controllerInstance[method] === 'function') {
			controllerInstance[method](data);

			return true;
		}

		return false;
	}

	/**
	 * Try handle event with extensions. If event is handled by
	 * extension then return true else return false.
	 *
	 * @private
	 * @method _handleEventWithExtensions
	 * @param {string} method
	 * @param {Object<string, *>} data
	 * @return {boolean}
	 */
	_handleEventWithExtensions(method, data) {
		var controllerInstance = this._managedPage.controllerInstance;
		var extensions = controllerInstance.getExtensions();

		for (var extension of extensions) {
			if (typeof extension[method] === 'function') {
				extension[method](data);

				return true;
			}
		}

		return false;
	}
}

ns.Ima.Page.Manager.Client = Client;
