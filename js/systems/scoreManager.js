// ScoreRecord - 分数记录类
class ScoreRecord {
    constructor(score, level, survivalTime, enemiesKilled, date = new Date()) {
        this.score = score;
        this.level = level;
        this.survivalTime = survivalTime; // 毫秒
        this.enemiesKilled = enemiesKilled;
        this.date = date;
        this.id = Date.now() + Math.random(); // 简单的唯一ID
    }

    // 获取格式化的生存时间
    getFormattedSurvivalTime() {
        const seconds = Math.floor(this.survivalTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}分${remainingSeconds}秒`;
        } else {
            return `${remainingSeconds}秒`;
        }
    }

    // 获取格式化的日期
    getFormattedDate() {
        return this.date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 获取记录数据
    getData() {
        return {
            id: this.id,
            score: this.score,
            level: this.level,
            survivalTime: this.survivalTime,
            enemiesKilled: this.enemiesKilled,
            date: this.date,
            formattedSurvivalTime: this.getFormattedSurvivalTime(),
            formattedDate: this.getFormattedDate()
        };
    }
}

// ScoreManager - 分数管理器
class ScoreManager {
    constructor() {
        this.records = [];
        this.maxRecords = 10; // 保存最多10条记录
        this.storageKey = 'thunderFighter_scores';
        
        // 统计数据
        this.stats = {
            totalGames: 0,
            totalScore: 0,
            totalSurvivalTime: 0,
            totalEnemiesKilled: 0,
            highestScore: 0,
            longestSurvivalTime: 0,
            highestLevel: 0,
            mostEnemiesKilled: 0,
            averageScore: 0,
            averageSurvivalTime: 0
        };
        
        // 加载保存的数据
        this.loadData();
        
        console.log('分数管理器初始化完成');
    }

    // 添加新的分数记录
    addScore(score, level, survivalTime, enemiesKilled) {
        const record = new ScoreRecord(score, level, survivalTime, enemiesKilled);
        
        // 添加到记录列表
        this.records.push(record);
        
        // 按分数排序（降序）
        this.records.sort((a, b) => b.score - a.score);
        
        // 保持最大记录数量
        if (this.records.length > this.maxRecords) {
            this.records = this.records.slice(0, this.maxRecords);
        }
        
        // 更新统计数据
        this.updateStats();
        
        // 保存数据
        this.saveData();
        
        // 检查是否创造新记录
        const isNewRecord = this.checkNewRecord(record);
        
        console.log(`新分数记录添加: ${score}分, 第${level}关, ${record.getFormattedSurvivalTime()}`);
        
        return {
            record: record.getData(),
            isNewRecord,
            rank: this.records.findIndex(r => r.id === record.id) + 1
        };
    }

    // 检查是否创造新记录
    checkNewRecord(record) {
        const records = {
            highestScore: record.score > this.stats.highestScore,
            longestSurvival: record.survivalTime > this.stats.longestSurvivalTime,
            highestLevel: record.level > this.stats.highestLevel,
            mostEnemies: record.enemiesKilled > this.stats.mostEnemiesKilled
        };
        
        return records;
    }

    // 更新统计数据
    updateStats() {
        if (this.records.length === 0) return;
        
        this.stats.totalGames = this.records.length;
        this.stats.totalScore = this.records.reduce((sum, r) => sum + r.score, 0);
        this.stats.totalSurvivalTime = this.records.reduce((sum, r) => sum + r.survivalTime, 0);
        this.stats.totalEnemiesKilled = this.records.reduce((sum, r) => sum + r.enemiesKilled, 0);
        
        this.stats.highestScore = Math.max(...this.records.map(r => r.score));
        this.stats.longestSurvivalTime = Math.max(...this.records.map(r => r.survivalTime));
        this.stats.highestLevel = Math.max(...this.records.map(r => r.level));
        this.stats.mostEnemiesKilled = Math.max(...this.records.map(r => r.enemiesKilled));
        
        this.stats.averageScore = Math.floor(this.stats.totalScore / this.stats.totalGames);
        this.stats.averageSurvivalTime = Math.floor(this.stats.totalSurvivalTime / this.stats.totalGames);
    }

    // 获取排行榜
    getLeaderboard() {
        return this.records.map((record, index) => ({
            rank: index + 1,
            ...record.getData()
        }));
    }

    // 获取最高分记录
    getHighestScore() {
        return this.records.length > 0 ? this.records[0] : null;
    }

    // 获取最长生存时间记录
    getLongestSurvival() {
        if (this.records.length === 0) return null;
        
        return this.records.reduce((longest, current) => 
            current.survivalTime > longest.survivalTime ? current : longest
        );
    }

    // 获取最高关卡记录
    getHighestLevel() {
        if (this.records.length === 0) return null;
        
        return this.records.reduce((highest, current) => 
            current.level > highest.level ? current : highest
        );
    }

    // 获取统计数据
    getStats() {
        return {
            ...this.stats,
            formattedLongestSurvival: this.formatTime(this.stats.longestSurvivalTime),
            formattedAverageSurvival: this.formatTime(this.stats.averageSurvivalTime),
            formattedTotalSurvival: this.formatTime(this.stats.totalSurvivalTime)
        };
    }

    // 格式化时间
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    // 获取玩家排名
    getPlayerRank(score) {
        let rank = 1;
        for (const record of this.records) {
            if (score > record.score) {
                break;
            }
            rank++;
        }
        return rank;
    }

    // 检查是否进入排行榜
    canEnterLeaderboard(score) {
        if (this.records.length < this.maxRecords) {
            return true;
        }
        
        const lowestScore = this.records[this.records.length - 1].score;
        return score > lowestScore;
    }

    // 显示新记录通知
    showNewRecordNotification(recordInfo) {
        const { record, isNewRecord, rank } = recordInfo;
        
        let message = `游戏结束！\n排名: 第${rank}名\n分数: ${record.score}`;
        
        const newRecords = [];
        if (isNewRecord.highestScore) newRecords.push('最高分');
        if (isNewRecord.longestSurvival) newRecords.push('最长生存');
        if (isNewRecord.highestLevel) newRecords.push('最高关卡');
        if (isNewRecord.mostEnemies) newRecords.push('最多击杀');
        
        if (newRecords.length > 0) {
            message += `\n🎉 新记录: ${newRecords.join(', ')}！`;
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'score-record-notification';
        notification.innerHTML = `
            <div class="record-icon">${rank <= 3 ? '🏆' : '📊'}</div>
            <div class="record-content">
                <div class="record-title">${newRecords.length > 0 ? '新记录！' : '游戏结束'}</div>
                <div class="record-rank">排名: 第${rank}名</div>
                <div class="record-score">分数: ${record.score}</div>
                ${newRecords.length > 0 ? `<div class="record-achievements">${newRecords.join(', ')}</div>` : ''}
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            background: ${rank <= 3 ? 'linear-gradient(45deg, #ffd700, #ffed4e)' : 'linear-gradient(45deg, #4CAF50, #45a049)'};
            color: #333;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            min-width: 300px;
            text-align: center;
            font-family: Arial, sans-serif;
            animation: recordPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes recordPop {
                0% { transform: translateX(-50%) scale(0.3); opacity: 0; }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); opacity: 1; }
            }
            .record-icon {
                font-size: 32px;
                margin-bottom: 10px;
            }
            .record-title {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 8px;
            }
            .record-rank {
                font-size: 16px;
                margin-bottom: 4px;
            }
            .record-score {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            .record-achievements {
                font-size: 14px;
                color: #ff6600;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // 点击关闭
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });
        
        // 自动关闭
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 5000);
    }

    // 保存数据到本地存储
    saveData() {
        try {
            const data = {
                records: this.records.map(record => ({
                    score: record.score,
                    level: record.level,
                    survivalTime: record.survivalTime,
                    enemiesKilled: record.enemiesKilled,
                    date: record.date.toISOString(),
                    id: record.id
                })),
                stats: this.stats
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('保存分数数据失败:', error);
        }
    }

    // 从本地存储加载数据
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return;

            const parsed = JSON.parse(data);
            
            // 加载记录
            if (parsed.records) {
                this.records = parsed.records.map(recordData => {
                    const record = new ScoreRecord(
                        recordData.score,
                        recordData.level,
                        recordData.survivalTime,
                        recordData.enemiesKilled,
                        new Date(recordData.date)
                    );
                    record.id = recordData.id;
                    return record;
                });
            }
            
            // 加载统计数据
            if (parsed.stats) {
                this.stats = { ...this.stats, ...parsed.stats };
            }
            
            console.log('分数数据加载完成');
        } catch (error) {
            console.error('加载分数数据失败:', error);
        }
    }

    // 清除所有记录（调试用）
    clearAllRecords() {
        this.records = [];
        this.stats = {
            totalGames: 0,
            totalScore: 0,
            totalSurvivalTime: 0,
            totalEnemiesKilled: 0,
            highestScore: 0,
            longestSurvivalTime: 0,
            highestLevel: 0,
            mostEnemiesKilled: 0,
            averageScore: 0,
            averageSurvivalTime: 0
        };
        
        this.saveData();
        console.log('所有分数记录已清除');
    }

    // 导出数据
    exportData() {
        return {
            records: this.getLeaderboard(),
            stats: this.getStats(),
            exportDate: new Date().toISOString()
        };
    }

    // 销毁分数管理器
    destroy() {
        this.saveData();
        console.log('分数管理器已销毁');
    }
}