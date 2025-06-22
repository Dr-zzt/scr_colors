document.addEventListener('DOMContentLoaded', function () {
    // 각 색조 폼의 초기값
    const initialValues = {
        dragbox: { r: 0.0625, g: 0.9875, b: 0.094, a: 1   },
        shadow:  { r: 0,      g: 0,      b: 0,     a: 1   },
        screen:  { r: 1,      g: 1,      b: 1,     a: 1   }
    };

    // 폼별로 동작을 일반화
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

        updatePreview();
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
    function addPaletteEditHandler() {
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
            renderEditTargets();
        });
    }

    // 변경 대상 렌더링 (컬러피커 연동)
    function renderEditTargets() {
        if (!paletteEditTargetsContainer) return;
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
            });
        });

        // 삭제 버튼 이벤트
        paletteEditTargetsContainer.querySelectorAll('button[data-remove]').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = this.dataset.remove;
                delete paletteEditTargets[idx];
                renderEditTargets();
            });
        });
    }

    // 팔레트 표 렌더링 후 클릭 이벤트 연결
    function renderPaletteTable(tilesetIndex) {
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
        addPaletteEditHandler();
    }

    // 초기 렌더링 및 드롭다운 이벤트
    const tilesetSelect = document.getElementById('tileset-select');
    if (tilesetSelect) {
        renderPaletteTable(Number(tilesetSelect.value));
        tilesetSelect.addEventListener('change', function () {
            renderPaletteTable(Number(this.value));
        });
    }

    // 텍스트 코드 팔레트 인덱스 원본 데이터 
    const textCodePaletteIndices = [
        0xC0,0x9B,0x9A,0x95,0x43,0x00,0x00,0x28,0x56,0xA7,0x6D,0x65,0x5C,0x00,0x00,0x8A,0x41,0xFF,0x53,0x97,0x47,0x00,0x00,0x8A,0x40,0x96,0x49,0x90,0x42,0x00,0x00,0x8A,0xA8,0xAE,0x17,0x5E,0xAA,0x00,0x00,0x8A,0xB5,0x75,0xBA,0xB9,0xB7,0x00,0x00,0x8A,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x8A,0x6F,0x17,0x5E,0xAA,0x8A,0x8A,0x8A,0x28,0xA5,0xA2,0x2D,0xA0,0x8A,0x8A,0x8A,0x8A,0x9F,0x9E,0x9D,0xB7,0x8A,0x8A,0x8A,0x8A,0xA4,0xA3,0xA1,0x0E,0x8A,0x8A,0x8A,0x8A,0x9C,0x1C,0x1A,0x13,0x8A,0x8A,0x8A,0x8A,0x13,0x12,0x11,0x57,0x8A,0x8A,0x8A,0x8A,0x54,0x51,0x4E,0x4A,0x8A,0x8A,0x8A,0x8A,0x87,0xA6,0x81,0x93,0x8A,0x8A,0x8A,0xB5,0xB9,0xB8,0xB7,0xB6,0x8A,0x8A,0x8A,0x8A,0x88,0x84,0x81,0x60,0x8A,0x8A,0x8A,0x8A,0x86,0x72,0x70,0x69,0x8A,0x8A,0x8A,0x8A,0x33,0x7C,0x7A,0xA0,0x8A,0x8A,0x8A,0x8A,0x4D,0x26,0x23,0x22,0x8A,0x8A,0x8A,0x8A,0x9A,0x97,0x95,0x91,0x8A,0x8A,0x8A,0x8A,0x88,0x84,0x81,0x60,0x8A,0x8A,0x8A,0x8A,0x80,0x34,0x31,0x2E,0x8A,0x8A,0x8A
    ];

    const colorCode = {
        0x02:0x01,0x03:0x09,0x04:0x11,0x05:0x19,0x06:0x21,0x07:0x29,0x08:0x41,0x0E:0x49,0x0F:0x51,0x10:0x59,0x11:0x61,0x15:0x69,0x16:0x71,0x17:0x79,0x18:0x81,0x19:0x89,0x1B:0x91,0x1C:0x99,0x1D:0xA1,0x1E:0xA9,0x1F:0xB9
    };

    const textcodeTable = document.getElementById('textcode-table');

    const textcodeEditTargets = document.getElementById('textcode-edit-targets');
    const selectedTextcodeRows = {}; // {code: {idx, colorIdx}}

    function renderTextcodeEditTargets() {
        if (!textcodeEditTargets) return;
        textcodeEditTargets.innerHTML = '';
        Object.entries(selectedTextcodeRows).forEach(([code, data]) => {
            const { idx, colorIdx } = data;
            const palette = colorTagTable[Number(tilesetSelect.value)];
            const color = palette[colorIdx];
            const row = document.createElement('div');
            row.className = 'edit-row';
            row.innerHTML = `
                <span class="textcode-label" style="min-width:48px;">${idx}</span>
                <span class="edit-color-preview" style="background:${color};"></span>
                <span class="color-number" style="min-width:40px;">${colorIdx}</span>
                <button type="button" data-edit="${code}" style="margin-left:8px;">수정</button>
                <button type="button" data-remove="${code}" style="margin-left:8px;">삭제</button>
            `;
            textcodeEditTargets.appendChild(row);
        });

        // 삭제 버튼 이벤트
        textcodeEditTargets.querySelectorAll('button[data-remove]').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.dataset.remove;
                delete selectedTextcodeRows[code];
                renderTextcodeEditTargets();
            });
        });
        
        // 수정 버튼 이벤트
        textcodeEditTargets.querySelectorAll('button[data-edit]').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.dataset.edit;
                showPaletteDropdownForEdit(code, btn);
            });
        });
    }

    // 수정용 256색 팔레트 드롭다운 표시 함수
    function showPaletteDropdownForEdit(code, anchorBtn) {

        // anchorBtn(수정 버튼) 바로 아래에 드롭다운 표시
        const rect = anchorBtn.getBoundingClientRect();

        // 이미 열려있는 드롭다운이 있으면 닫고 함수 종료
        const opened = document.querySelectorAll('.palette-edit-dropdown');
        if (opened.length > 0) {
            opened.forEach(el => el.remove());
            console.log('기존 드롭다운 닫음');
            return;
        }

        // 팔레트 드롭다운 생성
        const palette = colorTagTable[Number(tilesetSelect.value)];
        const dropdown = document.createElement('div');
        dropdown.className = 'palette-edit-dropdown dropdown-content';
        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = 100;
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 'px';

        // 팔레트 표 생성
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
                selectedTextcodeRows[code].colorIdx = idx;
                renderTextcodeEditTargets();
                dropdown.remove();
            });
        });

        // 바깥 클릭 시 닫기
        function closeDropdown(e) {
            if (!dropdown.contains(e.target) && !anchorBtn.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('mousedown', closeDropdown);
            }
        }
        setTimeout(() => {
            document.addEventListener('mousedown', closeDropdown);
        }, 0);

        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.top = rect.bottom + window.scrollY + 'px';

        document.body.appendChild(dropdown);
    }

    // 텍스트 코드 팔레트 행 클릭 이벤트
    function addTextcodeTableHandler() {
        const textcodeTable = document.getElementById('textcode-table');
        if (!textcodeTable) return;
        textcodeTable.addEventListener('click', function(e) {
            const tr = e.target.closest('tr');
            if (!tr) return;
            const label = tr.querySelector('.textcode-label');
            const colorNum = tr.querySelector('.color-number');
            if (!label || !colorNum) return;
            const code = label.textContent; // 예: \x02
            const colorIdx = parseInt(colorNum.textContent, 10);
            if (selectedTextcodeRows[code]) return; // 이미 추가된 항목은 중복 추가 안 함
            selectedTextcodeRows[code] = { idx: code, colorIdx };
            renderTextcodeEditTargets();
        });
    }

    // 텍스트 코드 팔레트 표 렌더링 후 클릭 이벤트 연결
    function renderTextcodeTable() {
        if (!tilesetSelect || !textcodeTable) return;
        const palette = colorTagTable[Number(tilesetSelect.value)];
        let html = '';
        for (let i = 0; i < textCodePaletteIndices.length; i++) {
            const code = i; // 0x02~0x1F
            if (!(i in colorCode)) continue;
            const idx = textCodePaletteIndices[colorCode[i]];
            const hex = code.toString(16).toUpperCase().padStart(2, '0');
            html += `
                <tr>
                    <td><span class="textcode-label">\\x${hex}</span></td>
                    <td><span class="color-indicator" style="background:${palette[idx]}"></span></td>
                    <td><span class="color-number">${idx}</span></td>
                </tr>
            `;
        }
        textcodeTable.querySelector('tbody').innerHTML = html;
        addTextcodeTableHandler();
    }

    // 타일셋 변경 시 텍스트 코드 팔레트도 갱신
    tilesetSelect.addEventListener('change', renderTextcodeTable);

    // 초기 렌더링
    renderTextcodeTable();
});