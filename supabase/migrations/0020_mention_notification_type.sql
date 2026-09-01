-- メンション通知用の種別を追加(既存トランザクションと分離するため単独ファイルにする)
alter type notification_type add value if not exists 'mention';
