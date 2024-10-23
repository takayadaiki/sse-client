import { fetchEventSource } from '@microsoft/fetch-event-source';

document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const tokenInput = document.getElementById('tokenInput');
    const sendButton = document.getElementById('sendButton');
    const resetButton = document.getElementById('resetButton');
    const responseElement = document.getElementById('response');
    const statusElement = document.getElementById('status'); // 新しく追加

    sendButton.addEventListener('click', () => {
        sendButton.disabled = true;
        responseElement.innerHTML = '';
        statusElement.innerHTML = ''; // ステータスをクリア
        const prompt = promptInput.value;
        const token = '';
        sendMessage(prompt, token);
    });

    resetButton.addEventListener('click', () => {
        responseElement.innerHTML = 'チャットをリセットしています...';
        statusElement.innerHTML = ''; // ステータスをクリア
        const token = '';
        resetChat(token);
    });
});

async function sendMessage(prompt, token = 'Os6_ShunLJ_3-DoRDu7GLg') {
    const responseElement = document.getElementById('response');
    const statusElement = document.getElementById('status');
    const sendButton = document.getElementById('sendButton');
    let isChatDone = false;

    try {
        await fetchEventSource('http://127.0.0.1:8000/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt }),
            onopen(response) {
                if (response.ok) {
                    // 接続成功
                } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    throw new Error(`エラーが発生しました: ${response.statusText}`);
                }
            },
            onmessage(event) {
                if (event.event === 'chat_done') {
                    // チャットが完了したことを記録
                    isChatDone = true;
                    sendButton.disabled = false;
                } else {
                    responseElement.innerHTML += event.data;
                }
            },
            onerror(err) {
                console.error('エラー:', err);
                responseElement.innerHTML += `\nエラーが発生しました: ${err.message}`;
                sendButton.disabled = false;
            },
            onclose() {
                // 接続が閉じられたときにチャットが完了していたらメッセージを表示
                if (isChatDone) {
                    statusElement.innerHTML = 'API 叩いて！';
                }
                sendButton.disabled = false;
            },
        });
    } catch (error) {
        responseElement.innerHTML += `\nエラーが発生しました: ${error.message}`;
        sendButton.disabled = false;
    }
}

async function resetChat(token = 'Os6_ShunLJ_3-DoRDu7GLg') {
    const responseElement = document.getElementById('response');
    const statusElement = document.getElementById('status'); // 追加
    try {
        await fetchEventSource('http://127.0.0.1:8000/v1/chat/reset', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            onopen(response) {
                if (response.ok) {
                    // 接続成功
                } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    throw new Error(`エラーが発生しました: ${response.statusText}`);
                }
            },
            onmessage(event) {
                responseElement.innerHTML += event.data;
            },
            onerror(err) {
                console.error('エラー:', err);
                responseElement.innerHTML += `\nエラーが発生しました: ${err.message}`;
            },
            onclose() {
                // 接続が閉じられたときの処理
                statusElement.innerHTML = ''; // ステータスをクリア
            },
        });
    } catch (error) {
        responseElement.innerHTML += `\nエラーが発生しました: ${error.message}`;
    }
}
