document.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('pluginInputText');
    if (saved) {
        document.getElementById('plugin-load-input').value = saved;
    }
    // 각 색조 폼의 초기값
    const initialValues = {
        dragbox: { r: 0.0625, g: 0.9875, b: 0.094, a: 1   },
        shadow:  { r: 0,      g: 0,      b: 0,     a: 1   },
        screen:  { r: 1,      g: 1,      b: 1,     a: 1   }
    };

    function setupColorFilter(formId, previewId, options = {}) {
        const form = document.getElementById(formId);
        const preview = document.getElementById(previewId);

        if (!form || !preview) return; // 요소가 없으면 함수 종료

        const rangeInputs = {
            r: form.querySelector('input[type="range"][name="r"]'),
            g: form.querySelector('input[type="range"][name="g"]'),
            b: form.querySelector('input[type="range"][name="b"]'),
            a: form.querySelector('input[type="range"][name="a"]')
        };
        const numInputs = {
            r: form.querySelector('input[type="number"][name="r-num"]'),
            g: form.querySelector('input[type="number"][name="g-num"]'),
            b: form.querySelector('input[type="number"][name="b-num"]'),
            a: form.querySelector('input[type="number"][name="a-num"]')
        };

        function updatePreview() {
            const r = Math.round(parseFloat(numInputs.r.value) * 255);
            const g = Math.round(parseFloat(numInputs.g.value) * 255);
            const b = Math.round(parseFloat(numInputs.b.value) * 255);
            const a = parseFloat(numInputs.a.value);
            preview.style.background = `rgba(${r},${g},${b},${a})`;
            if (updatePluginInputText) updatePluginInputText();
        }

        function syncRangeAndNum(channel, allowMax, disabled = false) {
            if (!rangeInputs[channel] || !numInputs[channel]) return;
            if (disabled) {
                rangeInputs[channel].disabled = true;
                numInputs[channel].disabled = true;
                return;
            }
            rangeInputs[channel].addEventListener('input', () => {
                numInputs[channel].value = rangeInputs[channel].value;
                updatePreview();
            });
            numInputs[channel].addEventListener('input', () => {
                let v = numInputs[channel].value;
                if (v === '') v = 0;
                v = Math.max(0, Math.min(allowMax, parseFloat(v)));
                rangeInputs[channel].value = Math.min(v, 1);
                numInputs[channel].value = v;
                updatePreview();
            });
        }

        syncRangeAndNum('r', 10, options.rDisabled);
        syncRangeAndNum('g', 10, options.gDisabled);
        syncRangeAndNum('b', 10, options.bDisabled);
        syncRangeAndNum('a', 1, options.aDisabled);

        // 초기화 버튼 이벤트
        const resetBtn = document.getElementById(formId.replace('-form', '-reset'));
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                let key = '';
                if (formId === 'dragbox-form') key = 'dragbox';
                else if (formId === 'shadow-form') key = 'shadow';
                else if (formId === 'screen-form') key = 'screen';
                if (!key) return;
                // 값 초기화
                rangeInputs.r.value = numInputs.r.value = initialValues[key].r;
                rangeInputs.g.value = numInputs.g.value = initialValues[key].g;
                rangeInputs.b.value = numInputs.b.value = initialValues[key].b;
                rangeInputs.a.value = numInputs.a.value = initialValues[key].a;
                updatePreview();
            });
        }
    }

    setupColorFilter('dragbox-form', 'dragbox-preview');
    setupColorFilter('shadow-form', 'shadow-preview', { aDisabled: true });
    setupColorFilter('screen-form', 'screen-preview');

    // 변경 대상 관리
    const paletteEditTargets = {}; // {색상번호: {r,g,b}}
    const paletteEditTargetsContainer = document.getElementById('palette-edit-targets');

    // HEX 변환 함수
    function rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map(x => {
                    const hex = Number(x).toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
        );
    }
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [
            (num >> 16) & 255,
            (num >> 8) & 255,
            num & 255
        ];
    }

    // 팔레트 셀 클릭 이벤트 추가
    function add256PaletteEditHandler() {
        const paletteTable = document.getElementById('palette-table');
        if (!paletteTable) return;
        paletteTable.addEventListener('click', function (e) {
            let cell = e.target.closest('td');
            if (!cell) return;
            const idx = cell.querySelector('.palette-cell span:last-child');
            if (!idx) return;
            const colorIdx = parseInt(idx.textContent, 10);
            if (isNaN(colorIdx)) return;
            // 이미 추가된 항목은 중복 추가 안 함
            if (paletteEditTargets[colorIdx]) return;

            // 현재 색상 추출 (hex → rgb)
            const colorSpan = cell.querySelector('.color-indicator');
            let rgb = [0,0,0];
            if (colorSpan) {
                const bg = colorSpan.style.background;
                if (bg.startsWith('#')) {
                    rgb = hexToRgb(bg);
                } else if (bg.startsWith('rgb')) {
                    rgb = bg.match(/\d+/g).map(Number);
                }
            }
            paletteEditTargets[colorIdx] = { r: rgb[0], g: rgb[1], b: rgb[2] };
            render256PaletteEditTargets();
        });
    }

    // 변경 대상 렌더링 (컬러피커 연동)
    function render256PaletteEditTargets() {
        if (typeof paletteEditTargetsContainer === 'undefined') return;
        paletteEditTargetsContainer.innerHTML = '';
        Object.entries(paletteEditTargets).forEach(([idx, rgb]) => {
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const row = document.createElement('div');
            row.className = 'edit-row';
            row.innerHTML = `
                <span style="width:32px;">${idx}</span>
                <span class="edit-color-preview" style="background:rgb(${rgb.r},${rgb.g},${rgb.b})"></span>
                <input type="color" value="${hex}" data-idx="${idx}">
                R <input type="number" min="0" max="255" value="${rgb.r}" data-idx="${idx}" data-c="r">
                G <input type="number" min="0" max="255" value="${rgb.g}" data-idx="${idx}" data-c="g">
                B <input type="number" min="0" max="255" value="${rgb.b}" data-idx="${idx}" data-c="b">
                <button type="button" data-remove="${idx}" style="margin-left:8px;">삭제</button>
            `;
            paletteEditTargetsContainer.appendChild(row);
            updatePluginInputText();
        });

        // 컬러피커 이벤트
        paletteEditTargetsContainer.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('input', function() {
                const idx = this.dataset.idx;
                const [r, g, b] = hexToRgb(this.value);
                paletteEditTargets[idx].r = r;
                paletteEditTargets[idx].g = g;
                paletteEditTargets[idx].b = b;
                // RGB 입력값과 미리보기 동기화
                const row = this.closest('.edit-row');
                if (row) {
                    row.querySelector('input[data-c="r"]').value = r;
                    row.querySelector('input[data-c="g"]').value = g;
                    row.querySelector('input[data-c="b"]').value = b;
                    row.querySelector('.edit-color-preview').style.background = `rgb(${r},${g},${b})`;
                }
                renderAllPaletteUIsAndPluginInput();
            });
        });

        // 입력값 변경 이벤트 (RGB → 컬러피커, 미리보기 동기화)
        paletteEditTargetsContainer.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function() {
                const idx = this.dataset.idx;
                const c = this.dataset.c;
                let v = Math.max(0, Math.min(255, parseInt(this.value,10)||0));
                this.value = v;
                paletteEditTargets[idx][c] = v;
                // 미리보기, 컬러피커 동기화
                const row = this.closest('.edit-row');
                if (row) {
                    const { r, g, b } = paletteEditTargets[idx];
                    row.querySelector('.edit-color-preview').style.background = `rgb(${r},${g},${b})`;
                    row.querySelector('input[type="color"]').value = rgbToHex(r, g, b);
                }
                renderAllPaletteUIsAndPluginInput();
            });
        });

        // 삭제 버튼 이벤트
        paletteEditTargetsContainer.querySelectorAll('button[data-remove]').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = this.dataset.remove;
                delete paletteEditTargets[idx];
                render256PaletteEditTargets();
                renderAllPaletteUIsAndPluginInput();
            });
        });
    }

    // 팔레트 표 렌더링 후 클릭 이벤트 연결
    function render256PaletteTable(tilesetIndex) {
        const paletteTable = document.getElementById('palette-table');
        if (!paletteTable) return;
        let html = '';
        const palette = colorTagTable[tilesetIndex];
        for (let row = 0; row < 16; row++) {
            html += '<tr>';
            for (let col = 0; col < 16; col++) {
                const idx = row * 16 + col;
                html += `<td>
                    <div class="palette-cell">
                        <span class="color-indicator" style="background:${palette[idx]}"></span>
                        <span>${idx}</span>
                    </div>
                </td>`;
            }
            html += '</tr>';
        }
        paletteTable.querySelector('tbody').innerHTML = html;

        // 표 렌더링 후 클릭 이벤트 연결
        add256PaletteEditHandler();
    }

    // 초기 렌더링 및 드롭다운 이벤트
    const tilesetSelect = document.getElementById('tileset-select');
    if (tilesetSelect) {
        render256PaletteTable(Number(tilesetSelect.value));
        tilesetSelect.addEventListener('change', function () {
            render256PaletteTable(Number(this.value));
        });
    }

    // 예시: 80개 색상
    const wireframeIntermediateEditTargets = {};
    const wireframeFinalEditTargets = {};

    const paletteUIs = [
        {
            // 텍스트 코드 팔레트
            names: [
                '\\x02', '\\x03', '\\x04', '\\x05', '\\x06', '\\x07', '\\x08',
                '\\x0E', '\\x0F', '\\x10', '\\x11', '\\x15', '\\x16', '\\x17',
                '\\x18', '\\x19', '\\x1B', '\\x1C', '\\x1D', '\\x1E', '\\x1F'
            ],
            indices: textCodePaletteIndices,
            mapping: colorCodeMapping, 
            editTargets: {}, // {name: {name, colorIdx}}
            tableId: 'textcode-table',
            editTargetsId: 'textcode-edit-targets',
            labelClass: 'textcode-label'
        },
        {
            // 기타 색
            names: [
                ...Array.from({length: 16}, (_, i) => `초상화 노이즈 색 ${i}`),
                '버튼 툴팁 내부 색',
                '버튼 툴팁 테두리 색',
                '미니맵 아군 색',
                '미니맵 자원 색'
            ],
            indices: miscColorIndices,
            mapping: miscColorMapping,
            editTargets: {},
            tableId: 'misc-table',
            editTargetsId: 'misc-edit-targets',
            labelClass: 'misc-label'
        },
        {
            names: [
                '색 0 (기본값 아군)',
                '색 1 (기본값 중립)',
                '색 2 (기본값 적)',
                '색 4 (정상 범위 밖)',
                '색 5 (정상 범위 밖)',
            ],
            indices: selectionCircleIndices, 
            mapping: selectionCircleMapping, 
            editTargets: {},
            tableId: 'selection-circle-table',
            editTargetsId: 'selection-circle-edit-targets',
            labelClass: 'selection-circle-label'
        },
        {
            // 와이어프레임 색상표
            names: [
                ...Array.from({length: 24}, (_, i) => String(i)),           // '0' ~ '23'
            ],
            indices: wireframeIntermediateIndices, 
            mapping: null, 
            editTargets: wireframeIntermediateEditTargets,
            tableId: 'wireframe-intermediate-table',
            editTargetsId: 'wireframe-intermediate-edit-targets',
            labelClass: 'wireframe-intermediate-label'
        }
    ];

    // 텍스트 코드 색의 미리보기 색상 계산 함수
    function getCurrentPaletteColor(idx) {
        if (paletteEditTargets[idx]) {
            const { r, g, b } = paletteEditTargets[idx];
            return `rgb(${r},${g},${b})`;
        }
        // 원본 팔레트 색상(hex) → rgb 변환
        const palette = colorTagTable[Number(tilesetSelect.value)];
        const hex = palette[idx];
        if (hex.startsWith('#')) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return `rgb(${r},${g},${b})`;
        }
        return hex; // 혹시 rgb 문자열이면 그대로 반환
    }

    // 범용 테이블 렌더링
    function renderPaletteTable({names, indices, mapping, tableId, labelClass}) {
        const tableElem = document.getElementById(tableId);
        if (!tableElem) return;
        let html = '';
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const idx = mapping ? indices[mapping[i]] : indices[i];
            const color = getCurrentPaletteColor(idx);
            html += `
                <tr>
                    <td><span class="${labelClass}">${name}</span></td>
                    <td><span class="color-indicator" style="background:${color};"></span></td>
                    <td><span class="color-number">${idx}</span></td>
                </tr>
            `;
        }
        tableElem.querySelector('tbody').innerHTML = html;
    }

    // 범용 선택 항목 렌더링
    function renderPaletteEditTargets({names, editTargets, editTargetsId, labelClass}) {
        const editTargetsElem = document.getElementById(editTargetsId);
        if (typeof editTargetsElem === 'undefined') return;
        editTargetsElem.innerHTML = '';
        console.log(editTargets);
        Object.entries(editTargets).forEach(([name, data]) => {
            const { colorIdx } = data;
            const color = getCurrentPaletteColor(colorIdx);
            const row = document.createElement('div');
            row.className = 'edit-row';
            row.innerHTML = `
                <span class="${labelClass}" style="min-width:150px;">${name}</span>
                <span class="edit-color-preview" style="background:${color};"></span>
                <span class="color-number" style="min-width:40px;">${colorIdx}</span>
                <button type="button" data-edit="${name}" style="margin-left:8px;">변경</button>
                <button type="button" data-remove="${name}" style="margin-left:8px;">삭제</button>
            `;
            editTargetsElem.appendChild(row);
            if (updatePluginInputText) {
                updatePluginInputText();
            }
        });

        // 삭제 버튼 이벤트
        editTargetsElem.querySelectorAll('button[data-remove]').forEach(btn => {
            btn.addEventListener('click', function() {
                const name = this.dataset.remove;
                delete editTargets[name];
                renderAllPaletteUIsAndPluginInput();
            });
        });

        // 수정 버튼 이벤트
        editTargetsElem.querySelectorAll('button[data-edit]').forEach(btn => {
            btn.addEventListener('click', function() {
                const name = this.dataset.edit;
                showPaletteDropdownForEditGeneric(name, btn, editTargets, renderAllPaletteUIsAndPluginInput);
            });
        });
    }

    // 범용 테이블 클릭 이벤트
    function addPaletteTableHandler({names, indices, tableId, editTargets, renderEditTargets}) {
        const tableElem = document.getElementById(tableId);
        if (!tableElem) return;
        tableElem.addEventListener('click', function(e) {
            const tr = e.target.closest('tr');
            if (!tr) return;
            const label = tr.querySelector('span');
            const colorNum = tr.querySelector('.color-number');
            if (!label || !colorNum) return;
            const name = label.textContent;
            const colorIdx = parseInt(colorNum.textContent, 10);
            if (editTargets[name]) return; // 이미 추가된 항목은 중복 추가 안 함
            editTargets[name] = { name, colorIdx };
            renderEditTargets();
        });
    }

    // 범용 수정용 256색 팔레트 드롭다운
    function showPaletteDropdownForEditGeneric(name, anchorBtn, editTargets, renderAll) {
        document.querySelectorAll('.palette-edit-dropdown').forEach(el => el.remove());

        const palette = colorTagTable[Number(tilesetSelect.value)];
        const dropdown = document.createElement('div');
        dropdown.className = 'palette-edit-dropdown dropdown-content';
        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = 1000;

        // 팔레트 표 생성 (palette-cell 구조 재활용)
        let html = '<table class="color-table"><tbody>';
        for (let row = 0; row < 16; row++) {
            html += '<tr>';
            for (let col = 0; col < 16; col++) {
                const idx = row * 16 + col;
                html += `<td data-idx="${idx}" style="cursor:pointer;">
                    <div class="palette-cell">
                        <span class="color-indicator" style="background:${palette[idx]}"></span>
                        <span>${idx}</span>
                    </div>
                </td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        dropdown.innerHTML = html;

        // 팔레트 셀 클릭 이벤트
        dropdown.querySelectorAll('td[data-idx]').forEach(td => {
            td.addEventListener('click', function() {
                const idx = Number(this.dataset.idx);
                editTargets[name].colorIdx = idx;
                renderAll();
                dropdown.remove();
            });
        });

        // 바깥 클릭 시 닫기
        function closeDropdown(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('mousedown', closeDropdown);
            }
        }
        setTimeout(() => {
            document.addEventListener('mousedown', closeDropdown);
        }, 0);

        // anchorBtn(수정 버튼) 바로 아래에 드롭다운 표시
        const rect = anchorBtn.getBoundingClientRect();
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 'px';

        document.body.appendChild(dropdown);
    }

    // 그룹명 배열 (예시: '테/프A 0/9' ~ '테/프A 9/9', '테/프B 0/9' ~ '테/프B 9/9')
    const wireframeFinalGroups = [
        ...Array.from({length: 10}, (_, i) => `테/프A ${i}/9`),
        ...Array.from({length: 10}, (_, i) => `테/프B ${i}/9`),
        ...Array.from({length: 8}, (_, i) => `실드 ${i}/7`),
        ...Array.from({length: 6}, (_, i) => `저그 ${i}/5`),
    ];
    const shieldStart = wireframeFinalGroups.indexOf('실드 0/7');
    const zergStart = wireframeFinalGroups.indexOf('저그 0/5');

    // wireframeFinalPalette는 256색 팔레트 배열(수정사항 반영 함수 사용)
    function getCurrentWireframeFinalColor(idx) {
        let intermediateIdx;
        if (wireframeIntermediateEditTargets && wireframeIntermediateEditTargets[idx] !== undefined) {
            intermediateIdx = wireframeIntermediateEditTargets[idx].colorIdx;
        } 
        else {
            intermediateIdx = wireframeIntermediateIndices[idx];
        }
        return getCurrentPaletteColor(intermediateIdx);
    }

    function renderWireframeFinalEditTargets() {
        const editTargetsElem = document.getElementById('wireframe-final-edit-targets');
        if (typeof editTargetsElem === 'undefined') return;
        editTargetsElem.innerHTML = '';

        // wireframeFinalEditTargets는 인덱스 기반 객체 또는 배열
        Object.entries(wireframeFinalEditTargets).forEach(([i, data]) => {
            const { name, colorIdx } = data;
            const color = getCurrentWireframeFinalColor(Number(colorIdx));

            const row = document.createElement('div');
            row.className = 'edit-row';
            row.innerHTML = `
                <span class="wireframe-final-label" style="min-width:48px;">${name}</span>
                <span class="edit-color-preview" style="background:${color};"></span>
                <span class="color-number" style="min-width:40px;">${colorIdx}</span>
                <button type="button" data-edit="${i}" style="margin-left:8px;">변경</button>
                <button type="button" data-remove="${i}" style="margin-left:8px;">삭제</button>
            `;
            editTargetsElem.appendChild(row);
        });

        // 삭제 버튼 이벤트
        editTargetsElem.querySelectorAll('button[data-remove]').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = this.dataset.remove;
                delete wireframeFinalEditTargets[idx];
                renderAllPaletteUIsAndPluginInput();
            });
        });

        // 수정 버튼 이벤트 (256색 팔레트 드롭다운)
        editTargetsElem.querySelectorAll('button[data-edit]').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = Number(this.dataset.edit);
                showPaletteDropdownForWireframeFinal(idx, btn);
            });
        });
    }
        
    function showPaletteDropdownForWireframeFinal(idx, anchorBtn) {
        // 기존 열려있는 드롭다운이 있으면 제거하고 함수 종료
        const opened = document.querySelector('.palette-edit-dropdown');
        if (opened) {
            opened.remove();
            return;
        }

        // 와이어프레임 색상표(중간 단계) 24개만 사용
        const dropdown = document.createElement('div');
        dropdown.className = 'palette-edit-dropdown dropdown-content';
        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = 1000;

        // 6x4 표로 24개 색상 표시
        let html = '<table class="color-table"><tbody>';
        for (let row = 0; row < 3; row++) {
            html += '<tr>';
            for (let col = 0; col < 8; col++) {
                const paletteIdx = row * 8 + col;
                html += `<td data-idx="${paletteIdx}" style="cursor:pointer;">
                    <div class="palette-cell">
                        <span class="color-indicator" style="background:${getCurrentWireframeFinalColor(paletteIdx)}"></span>
                        <span>${paletteIdx}</span>
                    </div>
                </td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        dropdown.innerHTML = html;

        // 팔레트 셀 클릭 이벤트
        dropdown.querySelectorAll('td[data-idx]').forEach(td => {
            td.addEventListener('click', function() {
                const paletteIdx = Number(this.dataset.idx);
                wireframeFinalEditTargets[idx].colorIdx = paletteIdx; 
                renderAllPaletteUIsAndPluginInput();
                dropdown.remove();
            });
        });

        // 바깥 클릭 시 닫기
        function closeDropdown(e) {
            if (!dropdown.contains(e.target) && anchorBtn && !anchorBtn.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('mousedown', closeDropdown);
            }
        }
        setTimeout(() => {
            document.addEventListener('mousedown', closeDropdown);
        }, 0);

        // anchorBtn(수정 버튼) 바로 아래에 드롭다운 표시
        const rect = anchorBtn.getBoundingClientRect();
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 'px';

        document.body.appendChild(dropdown);
    }

    // 드롭다운 표 렌더링 함수
    function renderWireframeFinalTable() {
        const tableElem = document.getElementById('wireframe-final-table');
        if (!tableElem) return;
        let i = 0;
        let html = '<tbody>';
        for (let g = 0; g < wireframeFinalGroups.length; g++) {
            html += '<tr>';
            // 1열: 그룹명
            html += `<td class="wireframe-final-label">${wireframeFinalGroups[g]}</td>`;
            // 2~5열: 각 그룹의 4개 항목
            const cellCount = (g >= shieldStart && g < zergStart) ? 2 : 4;
            for (let col = 0; col < cellCount ; col++) {
                const idx = wireframeFinalIndices[i];
                const color = getCurrentWireframeFinalColor(idx);
                html += `
                    <td data-idx="${idx}" data-i="${i}" style="cursor:pointer;">
                        <span class="color-indicator" style="background:${color};float:left"></span>
                        <span class="color-number" style="float:right;">${idx}</span>
                    </td>
                `;
                i++;
            }
            // 실드 그룹이면 빈 칸 2개 추가
            if (cellCount === 2) html += `<td></td><td></td>`;
            html += '</tr>';
        }
        html += '</tbody>';
        tableElem.innerHTML = html;

        tableElem.querySelectorAll('tr').forEach(tr => {
            tr.addEventListener('click', function(e) {
                // 그룹 내 모든 색상 셀(td[data-idx])을 순회
                this.querySelectorAll('td[data-idx]').forEach(td => {
                    const i = Number(td.dataset.i);
                    const name = `${i} (${this.querySelector('.wireframe-final-label').textContent})`;
                    const idx = td.dataset.idx;
                    if (!wireframeFinalEditTargets[idx]) {
                        wireframeFinalEditTargets[i] = {'name': name, 'colorIdx': idx};
                    }
                });
                renderAllPaletteUIsAndPluginInput();
            });
        });
    }

    // 모든 팔레트 UI 렌더링
    function renderAllPaletteUIsAndPluginInput() {
        paletteUIs.forEach(ui => {
            renderPaletteTable(ui);
            renderPaletteEditTargets(ui);
        });
        renderWireframeFinalTable();
        renderWireframeFinalEditTargets();
        updatePluginInputText();
    }

    // 모든 테이블에 클릭 이벤트 연결
    paletteUIs.forEach(ui => {
        addPaletteTableHandler({
            ...ui,
            renderEditTargets: () => renderPaletteEditTargets(ui)
        });
    });

    // 타일셋 변경 시 전체 갱신
    tilesetSelect.addEventListener('change', renderAllPaletteUIsAndPluginInput);

    // 초기 렌더링
    renderAllPaletteUIsAndPluginInput();

    // 복사 버튼 클릭 이벤트
    document.getElementById('copy-plugin-input-btn').addEventListener('click', function() {
        const pre = document.getElementById('plugin-input-pre');
        const text = pre.textContent;

        // 클립보드에 복사
        navigator.clipboard.writeText(text).then(() => {
            // 메시지 표시
            let msg = document.getElementById('copy-plugin-msg');
            if (!msg) {
                msg = document.createElement('span');
                msg.id = 'copy-plugin-msg';
                msg.textContent = '복사되었습니다!';
                msg.style.marginLeft = '12px';
                this.parentNode.appendChild(msg);
            }
            msg.style.display = 'inline';

            // 2초 후 메시지 숨김
            setTimeout(() => {
                msg.style.display = 'none';
            }, 2000);
        });
    });

    function updatePluginInputText() {
        let lines = [];

        // 1. Wireframe Color (와이어프레임 색)
        // wireframeFinalEditTargets: { idx: [name, colorIdx] }
        let wireframeColors = [];
        Object.entries(wireframeFinalEditTargets).forEach(([i, data]) => {
            const { colorIdx } = data;
            wireframeColors.push(`${i}, ${colorIdx}`); 
        });
        if (wireframeColors.length)
            lines.push('Wireframe Color: ' + wireframeColors.join('; '));

        // 2. Wireframe Palette (와이어프레임 색상표)
        // wireframeIntermediateEditTargets: { idx: colorIdx }
        let wireframePalettes = [];
        Object.entries(wireframeIntermediateEditTargets).forEach(([idx, data]) => {
            const { colorIdx } = data;
            wireframePalettes.push(`${idx}, ${colorIdx}`);
        });
        if (wireframePalettes.length)
            lines.push('Wireframe Palette: ' + wireframePalettes.join('; '));

        // 3. Selection Circle Palette
        // paletteUIs에서 selection-circle 관련 editTargets
        let selectionCircle = [];
        const selectionCircleUI = paletteUIs.find(ui => ui.tableId === 'selection-circle-table');
        if (selectionCircleUI) {
            Object.entries(selectionCircleUI.editTargets).forEach(([name, data]) => {
                selectionCircle.push(`${data.name.match(/(\d+)/)?.[0] || data.name}, ${data.colorIdx}`);
            });
        }
        if (selectionCircle.length)
            lines.push('Selection Circle Palette: ' + selectionCircle.join('; '));

        // 4. Text Palette
        // paletteUIs에서 textcode-table 관련 editTargets
        let textPalette = [];
        const textcodeUI = paletteUIs.find(ui => ui.tableId === 'textcode-table');
        if (textcodeUI) {
            Object.entries(textcodeUI.editTargets).forEach(([name, data]) => {
                // name이 \로 시작하면 0으로 대체
                let nameKey = data.name.startsWith('\\') ? '0' + data.name.slice(1) : data.name;
                textPalette.push(`${nameKey}, ${data.colorIdx}`);
            });
        }
        if (textPalette.length)
            lines.push('Text Palette: ' + textPalette.join('; '));

        // 5. Misc Palette
        // Misc Palette 이름 변환 테이블 (0~15까지 자동 생성)
        const miscPaletteNameTable = {};
        for (let i = 0; i < 16; i++) {
            miscPaletteNameTable[`초상화 노이즈 색 ${i}`] = `P${i}`;
        }
        Object.assign(miscPaletteNameTable, {
            '버튼 툴팁 내부 색': 'fill',
            '버튼 툴팁 테두리 색': 'line',
            '미니맵 아군 색': 'self',
            '미니맵 자원 색': 'res'
        });
        // paletteUIs에서 misc-table 관련 editTargets
        let miscPalette = [];
        const miscUI = paletteUIs.find(ui => ui.tableId === 'misc-table');
        if (miscUI) {
            Object.entries(miscUI.editTargets).forEach(([name, data]) => {
                miscPalette.push(`${miscPaletteNameTable[name]}, ${data.colorIdx}`);
            });
        }
        if (miscPalette.length)
            lines.push('Misc Palette: ' + miscPalette.join('; '));

        // 항상 소수점 한 자리(.0)까지 표기
        function formatFloat(val) {
            return Number(val).toFixed(1);
        }

        // 6. Dragbox Color Filter
        // 폼에서 값 읽기
        const dragbox = document.getElementById('dragbox-form');
        if (dragbox) {
            const A = dragbox.querySelector('input[name="a-num"]').value;
            const R = dragbox.querySelector('input[name="r-num"]').value;
            const G = dragbox.querySelector('input[name="g-num"]').value;
            const B = dragbox.querySelector('input[name="b-num"]').value;
            
            if (!(A === "1" && R === "0.0625" && G === "0.9875" && B === "0.094")) {
                lines.push(
                    `Dragbox Color Filter: A, ${formatFloat(A)}; R, ${formatFloat(R)}; G, ${formatFloat(G)}; B, ${formatFloat(B)}`
                );
            }
        }

        // 7. Shadow Color Filter
        const shadow = document.getElementById('shadow-form');
        if (shadow) {
            const A = shadow.querySelector('input[name="a-num"]').value;
            const R = shadow.querySelector('input[name="r-num"]').value;
            const G = shadow.querySelector('input[name="g-num"]').value;
            const B = shadow.querySelector('input[name="b-num"]').value;
            if (!(A === "1" && R === "0" && G === "0" && B === "0")) {
                lines.push(
                    `Shadow Color Filter: A, ${formatFloat(A)}; R, ${formatFloat(R)}; G, ${formatFloat(G)}; B, ${formatFloat(B)}`
                );
            }
        }

        // 8. Screen Color Filter
        const screen = document.getElementById('screen-form');
        if (screen) {
            const A = screen.querySelector('input[name="a-num"]').value;
            const R = screen.querySelector('input[name="r-num"]').value;
            const G = screen.querySelector('input[name="g-num"]').value;
            const B = screen.querySelector('input[name="b-num"]').value;
            if (!(A === "1" && R === "1" && G === "1" && B === "1")) {
                lines.push(
                    `Screen Color Filter: A, ${formatFloat(A)}; R, ${formatFloat(R)}; G, ${formatFloat(G)}; B, ${formatFloat(B)}`
                );
            }
        }

        // 9. 256 color palette (paletteEditTargets)
        let paletteLines = [];
        Object.entries(paletteEditTargets).forEach(([idx, rgb]) => {
            const hex = rgbToHex(rgb.b, rgb.g, rgb.r).toUpperCase(); // 여기는 BGR 순서로 변환
            paletteLines.push(`${idx}, 0x00${hex.substring(1)}`);
        });
        if (paletteLines.length)
            lines.push('256 color palette: ' + paletteLines.join('; '));

        const extra = document.getElementById('prompt-input');
        if (extra && extra.value.trim()) {
            lines.push(extra.value.trim());
        }

        document.getElementById('plugin-input-pre').textContent = lines.join('\n');
        localStorage.setItem('pluginInputText', document.getElementById('plugin-input-pre').textContent);
    }

    function resetAllData() {
        // 주요 데이터 모두 초기화
        if (typeof wireframeFinalEditTargets !== 'undefined') {
            Object.keys(wireframeFinalEditTargets).forEach(key => delete wireframeFinalEditTargets[key]);
        };
        if (typeof paletteEditTargets !== 'undefined') {
            Object.keys(paletteEditTargets).forEach(key => delete paletteEditTargets[key]);
        };

        // paletteUIs의 editTargets도 모두 초기화
        if (typeof paletteUIs !== 'undefined') {
            paletteUIs.forEach(ui => {
                if (ui.editTargets) 
                    Object.keys(ui.editTargets).forEach(key => delete ui.editTargets[key]);
            });
        }

        // ARGB 폼 값 초기화 (예시: dragbox, shadow, screen)
        ['dragbox-form', 'shadow-form', 'screen-form'].forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.querySelectorAll('input[type="number"]').forEach(input => {
                    // 기본값으로 초기화 (필요시 값 수정)
                    if (input.name === 'a-num') input.value = "1";
                    if (input.name === 'r-num') input.value = formId === 'shadow-form' ? "0" : (formId === 'dragbox-form' ? "0.0625" : "1");
                    if (input.name === 'g-num') input.value = formId === 'shadow-form' ? "0" : (formId === 'dragbox-form' ? "0.9875" : "1");
                    if (input.name === 'b-num') input.value = formId === 'shadow-form' ? "0" : (formId === 'dragbox-form' ? "0.094" : "1");
                    // 미리보기 갱신
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        });

        // 추가 옵션 입력란 초기화
        const promptInput = document.getElementById('prompt-input');
        if (promptInput) promptInput.value = '';

        const extraInput = document.getElementById('prompt-input');
        extraInput.value = ''; // 기존 입력값 초기화

        // 화면 갱신
        if (typeof renderWireframeFinalEditTargets === 'function') renderWireframeFinalEditTargets();
        if (typeof renderAllPaletteUIsAndPluginInput === 'function') renderAllPaletteUIsAndPluginInput();
        if (typeof updatePluginInputText ==='function') updatePluginInputText();
    }

    document.getElementById('plugin-reset-btn').addEventListener('click', resetAllData);

    document.getElementById('plugin-load-btn').addEventListener('click', function() {
        const input = document.getElementById('plugin-load-input').value.trim();
        if (!input) return;

        resetAllData(); // 기존 데이터 초기화

        // 줄 단위로 파싱
        const lines = input.split('\n');
        lines.forEach(line => {
            if (line.startsWith('Wireframe Color:')) {
                Object.keys(wireframeFinalEditTargets).forEach(key => delete wireframeFinalEditTargets[key]);
                line.replace('Wireframe Color:', '').split(';').forEach(pair => {
                    const [idx, val] = pair.split(',').map(s => s.trim());
                    if (idx && val) {
                        let nameIndex;
                        if (Number(idx) < shieldStart * 4) {
                            nameIndex = Math.floor(Number(idx) / 4);
                        }
                        else if (Number(idx) < shieldStart * 4 + (zergStart - shieldStart) * 2) {
                            nameIndex = Math.floor((Number(idx) - shieldStart * 4) / 2) + shieldStart; // 실드 그룹
                        }
                        else {
                            nameIndex = Math.floor((Number(idx) - (shieldStart * 4 + (zergStart - shieldStart) * 2)) / 4) + zergStart; // 저그 그룹
                        }
                        const name = `${idx} (${wireframeFinalGroups[nameIndex]})`;
                        wireframeFinalEditTargets[idx] = { 
                            name: name,
                            colorIdx: Number(val)
                        }
                    }
                });
            }
            // Wireframe Palette
            else if (line.startsWith('Wireframe Palette:')) {
                Object.keys(wireframeIntermediateEditTargets).forEach(key => delete wireframeIntermediateEditTargets[key]);
                line.replace('Wireframe Palette:', '').split(';').forEach(pair => {
                    const [name, idx] = pair.split(',').map(s => s.trim());
                    if (name && idx) wireframeIntermediateEditTargets[name] = { name, colorIdx: Number(idx) };
                });
            }
            // Selection Circle Palette
            else if (line.startsWith('Selection Circle Palette:')) {
                const ui = paletteUIs.find(ui => ui.tableId === 'selection-circle-table');
                if (ui) {
                    ui.editTargets = {};
                    line.replace('Selection Circle Palette:', '').split(';').forEach(pair => {
                        const [name, idx] = pair.split(',').map(s => s.trim());
                        if (name && idx) ui.editTargets[name] = { name, colorIdx: Number(idx) };
                    });
                }
            }
            // Text Palette: ...
            else if (line.startsWith('Text Palette:')) {
                const ui = paletteUIs.find(ui => ui.tableId === 'textcode-table');
                if (ui) {
                    ui.editTargets = {};
                    line.replace('Text Palette:', '').split(';').forEach(pair => {
                        const [name, idx] = pair.split(',').map(s => s.trim());
                        if (name && idx) ui.editTargets[name] = { name, colorIdx: Number(idx) };
                    });
                }
            }
            // Misc Palette: ...
            else if (line.startsWith('Misc Palette:')) {
                const ui = paletteUIs.find(ui => ui.tableId === 'misc-table');
                if (ui) {
                    ui.editTargets = {};
                    line.replace('Misc Palette:', '').split(';').forEach(pair => {
                        // 이름 변환: P0 ~ P15, fill, line, self, res
                        const miscPaletteNameTable = {
                            'P0': '초상화 노이즈 색 0',
                            'P1': '초상화 노이즈 색 1',
                            'P2': '초상화 노이즈 색 2',
                            'P3': '초상화 노이즈 색 3',
                            'P4': '초상화 노이즈 색 4',
                            'P5': '초상화 노이즈 색 5',
                            'P6': '초상화 노이즈 색 6',
                            'P7': '초상화 노이즈 색 7',
                            'P8': '초상화 노이즈 색 8',
                            'P9': '초상화 노이즈 색 9',
                            'P10': '초상화 노이즈 색 10',
                            'P11': '초상화 노이즈 색 11',
                            'P12': '초상화 노이즈 색 12',
                            'P13': '초상화 노이즈 색 13',
                            'P14': '초상화 노이즈 색 14',
                            'P15': '초상화 노이즈 색 15',
                            'fill': '버튼 툴팁 내부 색',
                            'line': '버튼 툴팁 테두리 색',
                            'self': '미니맵 아군 색',
                            'res': '미니맵 자원 색'
                        };
                        const [name, idx] = pair.split(',').map(s => s.trim());
                        const originalName = miscPaletteNameTable[name] || name; // 변환된 이름 또는 원본
                        if (originalName && idx) ui.editTargets[originalName] = { originalName, colorIdx: Number(idx) };
                    });
                }
            }
            // 256 color palette: 186, 0x00FFFFFF; ...
            else if (line.startsWith('256 color palette:')) {
                Object.keys(paletteEditTargets).forEach(key => delete paletteEditTargets[key]);
                line.replace('256 color palette:', '').split(';').forEach(pair => {
                    const [idx, hex] = pair.split(',').map(s => s.trim());
                    if (idx && hex && hex.startsWith('0x00')) {
                        const [b, g, r] = hexToRgb('#' + hex.substring(4));
                        if (b === undefined || g === undefined || r === undefined) return;
                        paletteEditTargets[idx] = {r, g, b};
                        console.log(paletteEditTargets);
                    }
                });
            }
            // Dragbox Color Filter: A, 1.0; R, 1.0; G, 0.05; B, 0.6
            else if (line.startsWith('Dragbox Color Filter:')) {
                const dragbox = document.getElementById('dragbox-form');
                if (dragbox) {
                    const vals = {};
                    line.replace('Dragbox Color Filter:', '').split(';').forEach(pair => {
                        const [k, v] = pair.split(',').map(s => s.trim());
                        if (k && v) vals[k] = v;
                    });
                    ['a-num', 'r-num', 'g-num', 'b-num'].forEach(k => {
                        const input = dragbox.querySelector(`input[name="${k}"]`);
                        if (input && vals[k[0].toUpperCase()]) 
                        {
                            input.value = vals[k[0].toUpperCase()];
                            input.dispatchEvent(new Event('input')); // 값 변경 이벤트 트리거
                        }
                    });
                }
            }
            // Shadow Color Filter: ...
            else if (line.startsWith('Shadow Color Filter:')) {
                const shadow = document.getElementById('shadow-form');
                if (shadow) {
                    const vals = {};
                    line.replace('Shadow Color Filter:', '').split(';').forEach(pair => {
                        const [k, v] = pair.split(',').map(s => s.trim());
                        if (k && v) vals[k] = v;
                    });
                    ['a-num', 'r-num', 'g-num', 'b-num'].forEach(k => {
                        const input = shadow.querySelector(`input[name="${k}"]`);
                        if (input && vals[k[0].toUpperCase()]) 
                        {
                            input.value = vals[k[0].toUpperCase()];
                            input.dispatchEvent(new Event('input')); // 값 변경 이벤트 트리거
                        }
                    });
                }
            }
            // Screen Color Filter: ...
            else if (line.startsWith('Screen Color Filter:')) {
                const screen = document.getElementById('screen-form');
                if (screen) {
                    const vals = {};
                    line.replace('Screen Color Filter:', '').split(';').forEach(pair => {
                        const [k, v] = pair.split(',').map(s => s.trim());
                        if (k && v) vals[k] = v;
                    });
                    ['a-num', 'r-num', 'g-num', 'b-num'].forEach(k => {
                        const input = screen.querySelector(`input[name="${k}"]`);
                        if (input && vals[k[0].toUpperCase()]) 
                        {
                            input.value = vals[k[0].toUpperCase()];
                            input.dispatchEvent(new Event('input')); // 값 변경 이벤트 트리거
                        }
                    });
                }
            }
            else {
                // 추가 입력 필드에 추가 (예: 프롬프트 입력)
                const extraInput = document.getElementById('prompt-input');
                if (extraInput) {
                    const trimmed = line.trim();
                    if (trimmed) {
                        extraInput.value += (extraInput.value ? '\n' : '') + trimmed;
                    }
                }
            }
        });

        // 각 UI 갱신
        render256PaletteEditTargets();
        renderAllPaletteUIsAndPluginInput();

        // 입력 필드 초기화
        document.getElementById('plugin-load-input').value = ''; // 로드 입력 필드 초기화
    });

    document.getElementById('prompt-input').addEventListener('input', function() {
        updatePluginInputText && updatePluginInputText();
    });
});