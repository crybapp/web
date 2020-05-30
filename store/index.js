import { parse } from 'cookieparser'
import cookies from 'browser-cookies'

import Mesa from 'mesa-js-client'

const isProduction = () => process.env.NODE_ENV === 'production'

export const getters = {
    user: ({ user }) => user,
    userId: ({ userId }) => userId,

    users: ({ users }) => users,

    onlineUsers: ({ users, onlineUsers }) => {
        return onlineUsers ? [
            ...new Set(
                onlineUsers
                    .map(id => users[id] || null)
                    .filter((user, i) => user !== null && onlineUsers.indexOf(user.id) >= i)
            )
        ] : []
    },
    onlineUserIds: ({ onlineUsers }) => onlineUsers ? [...new Set(onlineUsers)] : [],
    typingUsers: ({ users, userId, typingUsers }) => {
        return [
            ...new Set(
                typingUsers
                .map(id => users[id] || null)
                .filter(user => user.id !== userId && user !== null)
            )
        ]
    },

    token: ({ token }) => token,

    room: ({ room }) => room,
    sendingMessages: ({ sendingMessages }) => sendingMessages,

    portal: ({ portal }) => portal,

    messages: ({ room }) => room ? (room.messages || []) : [],
    controllerId: ({ controllerId }) => controllerId,

    queueStatus: ({ queueStatus }) => queueStatus, 

    apertureWs: ({ apertureWs }) => apertureWs,
    apertureToken: ({ apertureToken }) => apertureToken,

    janusId: ({ janusId }) => janusId,
    janusIp: ({ janusIp }) => janusIp,

    viewerMuted: ({ viewerMuted }) => viewerMuted,
    viewerVolume: ({ viewerVolume }) => (viewerVolume/100),

    mesa: ({ mesa }) => mesa
}

const initialState = () => ({
    user: null,
    userId: null,

    users: {},
    token: null,

    room: null,
    controllerId: null,
    onlineUsers: [],

    portal: null,

    typingUsers: [],
    sendingMessages: [],

    queueStatus: null, 

    apertureWs: null,
    apertureToken: null,
    janusId: null,
    janusIp: null,

    viewerMuted: false,
    viewerVolume: 30,

		mesa: null
})

export const state = () => initialState()

export const mutations = {
    /**
     * User / Self User
     */
    handleUser(state, user) {
        state.users[user.id] = user
    },

    handleSelfUser(state, user) {
        state.user = user
        state.users[user.id] = user
    },

    handleUserId(state, userId) {
        state.userId = userId
    },

    handleToken(state, { token, save }) {
        state.token = token

        this.$axios.setHeader('authorization', `Bearer ${token}`)

        if (token && save && process.client)
            cookies.set('token', token, {
                expires: 365,
                domain: process.env.COOKIE_DOMAIN,
                secure: isProduction()
            })
        else if (save && process.client)
            cookies.erase('token', {
                domain: process.env.COOKIE_DOMAIN
            })
    },

    /**
     * Room
     */
    handleRoom(state, room) {
        if (room) {
            state.room = room
            state.user.room = room

            state.onlineUsers = room.online

            if (room.portal)
                state.portal = room.portal

            if (!room.messages)
                state.room.messages = []

            if (room.controller)
                if (typeof room.controller === 'string')
                    state.controllerId = room.controller
                else
                    state.controllerId = room.controller.id

            if (state.onlineUsers && state.onlineUsers.indexOf(state.userId) === -1)
                state.onlineUsers.push(state.userId)

            if (room.members)
                room.members.forEach(member => this.commit('handleUser', member))
        } else {
            state.room = null
            state.user.room = null

            state.portal = null

            state.typingUsers = []
            state.onlineMembers = []
            state.controllerId = null
        }
    },

    /**
     * Portal
     */
    updatePortal(state, allocation) {
        if (!state.room) return

        state.portal = allocation
        state.room.portal = allocation

        if(allocation.status === 'creating' || allocation.status === 'starting' || allocation.status === 'open')
            this.commit('updateQueueStatus', null)
    },

    /**
     * QueueStatus
     */
    updateQueueStatus(state, status) {
        if(!state.room) return

        state.queueStatus = status
    },

    /**
     * Aperture
     */
    updateAperture(state, config) {
        if (!state.room) return

        state.apertureWs = config.ws
        state.apertureToken = config.t
    },

    /**
     * Janus
     */
    updateJanus(state, config) {
        if(!state.room) return

        state.janusId = config.id
        state.janusIp = config.ip
    },

    /**
     * Viewer State
     */
    setMutedStatus(state, isMuted) {
        state.viewerMuted = isMuted
    },
    setViewerVolume(state, newVolume) {
        state.viewerVolume = newVolume
    },

    /**
     * Invite
     */
    handleInvite(state, invite) {
        if (!state.room) return

        state.room.invites = [ invite ]
    },

    /**
     * Messages
     */
    pushMessage(state, message) {
        if (!state.room) return

        if (!state.room.messages)
            state.room.messages = []

        const lastGroup = state.room.messages[state.room.messages.length - 1], { id, author } = message

        if (message.author === state.userId)
            state.sendingMessages.splice(state.sendingMessages.indexOf(message.content), 1)
        else
            this.commit('updateTypingStatus', { u: message.author, typing: false })

        if (lastGroup && lastGroup.author === author) {
            state.room.messages[state.room.messages.length - 1].messages.push(message)
            state.room.messages[state.room.messages.length - 1].messageIds.push(message.id)
        } else
            state.room.messages.push({
                id, author,
                messages: [message],
                messageIds: [id]
            })
    },

    pushSendingMessage(state, { content }) {
        state.sendingMessages.push(content)
    },

    pullMessage(state, messageId) {
        if (!state.room) return
        if (state.room.messages.length === 0) return

        const messageIds = state.room.messages.map(({ messageIds }) => messageIds)

        let groupMessageIndex = -1, groupIndex = -1

        messageIds.forEach((ids, i) => {
            if (groupIndex > -1 && groupMessageIndex > -1) return

            groupIndex = i
            groupMessageIndex = ids.indexOf(messageId)
        })

        state.room.messages[groupIndex].messages.splice(groupMessageIndex, 1)
        state.room.messages[groupIndex].messageIds.splice(groupMessageIndex, 1)

        if (state.room.messages[groupIndex].messages.length === 0)
            state.room.messages.splice(groupIndex, 1)
    },

    /**
     * Room User State
     */
    handleUserJoin(state, user) {
        state.users[user.id] = user

        if (state.room)
            if (state.room.members.indexOf(user.id) === -1)
                state.room.members.push(user)
    },

    handleUserLeave(state, { u: userId }) {
        if (state.userId === userId) return

        if (state.room) {
            const memberIndex = state.room.members.map(({ id }) => id).indexOf(userId)
            state.room.members.splice(memberIndex, 1)
        }

        if (state.onlineMembers)
            state.onlineMembers.splice(state.onlineMembers.indexOf(userId), 1)
    },

    handleOwnerUpdate(state, { u: userId }) {
        if (!state.room) return

        const user = state.users[userId]
        if (!user) return state.room.owner = userId

        state.room.owner = user
    },

    /**
     * Typing
     */
    setTypingStatus(state, typing) {
				if (!state.mesa && !state.mesa.ws)
					return
				else if (state.mesa.ws.readyState !== WebSocket.OPEN)
					return

        state.mesa.send({
					opcode: 0,
					data: { typing },
					type: 'TYPING_UPDATE'
				})
    },

    updateTypingStatus(state, { typing, u: userId }) {
        if (userId === state.userId) return

        if (typing)
            state.typingUsers.push(userId)
        else
            state.typingUsers.splice(state.typingUsers.indexOf(userId), 1)
    },

    /**
     * Presence
     */
    updatePresence(state, { u: userId, presence }) {
			if (userId === state.userId) return

			if(presence === 'online' && state.onlineUsers.indexOf(userId) === -1)
				state.onlineUsers.push(userId)
			else
				state.onlineUsers.splice(state.onlineUsers.indexOf(userId), 1)
    },

    /**
     * Controller
     */
    updateController(state, { u: controllerId }) {
        state.controllerId = controllerId
    },

    /**
     * Cookies
        */
    allowCookies(state, { save } = { save: true }) {
        if (save && process.client)
            cookies.set('cookies', '1', {
                expires: 365 * 10, // 10 years
                domain: process.env.COOKIE_DOMAIN,
                secure: isProduction()
            })
    },

    /**
     * WebSocket
     */
    setupWebSocket(state) {
        console.log(state.token)
        if (!state.token)
            return

        const { token } = state, mesa = new Mesa(process.env.WS_URL, { autoConnect: false })

        mesa.onConnected = async () => {
            console.log('connected')

            await mesa.authenticate({ token })
        }

        mesa.onMessage = (op, d, t) => {
					if (op === 0) {
						if (t.split('_')[0] === 'PORTAL')
								return this.commit('updatePortal', d)

						switch(t) {
							// ROOM
							case 'CONTROLLER_UPDATE':
								this.commit('updateController', d)
								break
							case 'QUEUE_UPDATE':
								this.commit('updateQueueStatus', d)
								break
							case'JANUS_CONFIG':
								this.commit('updateJanus', d)
								break
							case 'APERTURE_CONFIG':
								this.commit('updateAperture', d)
								console.log("Aperture config received.")
								break
							case 'ROOM_DESTROY':
								this.commit('handleRoom', null)
								this.app.router.push('/home')
								break
							case 'INVITE_UPDATE':
								this.commit('handleInvite', d)
								break
							// USER
							case 'USER_JOIN':
								this.commit('handleUserJoin', d)
								break
							case 'USER_UPDATE':
								this.commit('handleUser', d)
								break
							case 'USER_LEAVE':
								this.commit('handleUserLeave', d)
								break
							case 'OWNER_UPDATE':
								this.commit('handleOwnerUpdate', d)
								break
							case 'PRESENCE_UPDATE':
								this.commit('updatePresence', d)
								break
							// MESSAGE
							case 'MESSAGE_CREATE':
								this.commit('pushMessage', d)
								break
							case 'MESSAGE_DESTROY':
								this.commit('pullMessage', d.id)
								break
							case 'TYPING_UPDATE':
								this.commit('updateTypingStatus', d)
								break
						}
					} 
				}

				mesa.connect()
				
				state.mesa = mesa
    },

    disconnectWebSocket(state) {
        if (state.mesa) {
            state.mesa.disconnect(1000)
            state.mesa = null
        }

        if (state.portal)
            state.portal = null

        if (state.controllerId)
            state.controllerId = null
    },

    logout(_state) {
        if (_state.mesa)
            this.commit('disconnectWebSocket')

        const state = initialState(), SAFE_KEYS = []
        Object.keys(state).forEach(key =>
            SAFE_KEYS.indexOf(key) === -1 ?
            _state[key] = state[key] :
            0
        )

        if (process.client)
            cookies.erase('token', {
                domain: process.env.COOKIE_DOMAIN
            })
    }
}

export const actions = {
    async fetchUser({ commit }) {
        try {
            const user = await this.$axios.$get('user/me')

            commit('handleSelfUser', user)
            commit('handleUserId', user.id)
            commit('handleRoom', user.room)
        } catch(error) {
            if (error.response && error.response.data.response === 'USER_NO_AUTH')
                commit('logout')
            else
                console.error(error)
        }
    },

    async fetchRoom({ commit }) {
        try {
            const room = await this.$axios.$get(`room`)

            commit('handleRoom', room)
        } catch(error) {
            console.error(error)
        }
    },

    async leaveRoom({ commit }) {
        try {
            await this.$axios.$post('room/leave')

            commit('handleRoom', null)
        } catch(error) {
            console.error(error)

            if (error && error.response && error.response.status === 410)
                commit('handleRoom', null)
        }
    },

    async takeControl({ state, commit }) {
        try {
            await this.$axios.$post('room/controller/take')

            commit('updateController', { u: state.userId })
        } catch(error) {
            console.error(error)
        }
    },

    async giveControl({ commit }, userId) {
        try {
            await this.$axios.$post(`/room/controller/give/${userId}`)

            commit('updateController', { u: userId })
        } catch(error) {
            console.error(error)
        }
    },

    async releaseControl({ commit }) {
        try {
            await this.$axios.$post('room/controller/release')

            commit('updateController', { u: null })
        } catch(error) {
            console.error(error)
        }
    },

    async nuxtClientInit({ commit }) {
        const token = cookies.get('token')

        if (token) {
            commit('handleToken', { token, save: false })
            if (!this.user)
               await this.dispatch('fetchUser')
        }
    },

    async nuxtServerInit({ commit }, { req }) {
        if (!req || typeof req.headers.cookie !== 'string') return

        const { token } = parse(req.headers.cookie)

        if (token) {
            commit('handleToken', { token, save: false })
            await this.dispatch('fetchUser')
        }
    }
}
