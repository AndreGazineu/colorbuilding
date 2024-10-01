function handleFile() {
    const fileInput = document.getElementById('excelFile');
    if (fileInput.files.length === 0) {
        alert('Por favor, selecione um arquivo.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (jsonData.length === 0) {
                alert('Nenhum dado encontrado na planilha.');
                return;
            }
            convertToJson(jsonData);
        } catch (error) {
            alert('Erro ao ler o arquivo: ' + error.message);
        }
    };
    reader.onerror = () => {
        alert('Erro ao ler o arquivo.');
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function convertToJson(jsonData) {
    const cc_ns = "http://colorexchangeformat.com/CxF3-core";
    const et_ns = "http://colorexchangeformat.com/CxF3-eXactTolerancing";
    const xsi_ns = "http://www.w3.org/2001/XMLSchema-instance";

    const xmlDoc = document.implementation.createDocument(cc_ns, "CxF", null);
    const root = xmlDoc.documentElement;
    root.setAttribute("xmlns:cc", cc_ns);
    root.setAttribute("xmlns:et", et_ns);
    root.setAttribute("xmlns:xsi", xsi_ns);

    const fileInfo = xmlDoc.createElementNS(cc_ns, "cc:FileInformation");
    root.appendChild(fileInfo);

    const creator = xmlDoc.createElementNS(cc_ns, "cc:Creator");
    creator.textContent = "X-Rite eXact Manager";
    fileInfo.appendChild(creator);

    const description = xmlDoc.createElementNS(cc_ns, "cc:Description");
    description.textContent = "C:/Users/Dell/Desktop/TESTE.cxf";
    fileInfo.appendChild(description);

    const tag1 = xmlDoc.createElementNS(cc_ns, "cc:Tag");
    tag1.setAttribute("Name", "FileType");
    tag1.setAttribute("Value", "Color Library");
    fileInfo.appendChild(tag1);

    const tag2 = xmlDoc.createElementNS(cc_ns, "cc:Tag");
    tag2.setAttribute("Name", "IsReadOnly");
    tag2.setAttribute("Value", "False");
    fileInfo.appendChild(tag2);

    const resources = xmlDoc.createElementNS(cc_ns, "cc:Resources");
    root.appendChild(resources);

    const objectCollection = xmlDoc.createElementNS(cc_ns, "cc:ObjectCollection");
    resources.appendChild(objectCollection);

    jsonData.forEach((color, idx) => {
        const obj = xmlDoc.createElementNS(cc_ns, "cc:Object");
        obj.setAttribute("ObjectType", "Standard");
        obj.setAttribute("Name", color.name);
        obj.setAttribute("Id", `R${idx}`);
        obj.setAttribute("GUID", uuidv4());
        objectCollection.appendChild(obj);

        const creationDate = xmlDoc.createElementNS(cc_ns, "cc:CreationDate");
        creationDate.textContent = new Date().toISOString();
        obj.appendChild(creationDate);

        const colorValues = xmlDoc.createElementNS(cc_ns, "cc:ColorValues");
        obj.appendChild(colorValues);

        const lab = xmlDoc.createElementNS(cc_ns, "cc:ColorCIELab");
        lab.setAttribute("ColorSpecification", "CSM0D502");
        colorValues.appendChild(lab);

        const L = parseFloat(color.L) || 0;
        const A = parseFloat(color.a) || 0;
        const B = parseFloat(color.b) || 0;

        const LElement = xmlDoc.createElementNS(cc_ns, "cc:L");
        LElement.textContent = L.toFixed(2);
        lab.appendChild(LElement);

        const AElement = xmlDoc.createElementNS(cc_ns, "cc:A");
        AElement.textContent = A.toFixed(2);
        lab.appendChild(AElement);

        const BElement = xmlDoc.createElementNS(cc_ns, "cc:B");
        BElement.textContent = B.toFixed(2);
        lab.appendChild(BElement);
    });

    const colorSpecCollection = xmlDoc.createElementNS(cc_ns, "cc:ColorSpecificationCollection");
    resources.appendChild(colorSpecCollection);

    for (let idx = 0; idx < 4; idx++) {
        const colorSpec = xmlDoc.createElementNS(cc_ns, "cc:ColorSpecification");
        colorSpec.setAttribute("Id", `CSM0D502${idx === 0 ? '' : `-${idx}`}`);
        colorSpecCollection.appendChild(colorSpec);

        const tristimulusSpec = xmlDoc.createElementNS(cc_ns, "cc:TristimulusSpec");
        colorSpec.appendChild(tristimulusSpec);

        const illuminant = xmlDoc.createElementNS(cc_ns, "cc:Illuminant");
        illuminant.textContent = "D50";
        tristimulusSpec.appendChild(illuminant);

        const observer = xmlDoc.createElementNS(cc_ns, "cc:Observer");
        observer.textContent = "2_Degree";
        tristimulusSpec.appendChild(observer);

        const method = xmlDoc.createElementNS(cc_ns, "cc:Method");
        method.textContent = "E308_Table5";
        tristimulusSpec.appendChild(method);

        const measurementSpec = xmlDoc.createElementNS(cc_ns, "cc:MeasurementSpec");
        colorSpec.appendChild(measurementSpec);

        const measurementType = xmlDoc.createElementNS(cc_ns, "cc:MeasurementType");
        measurementType.textContent = idx === 0 ? "Colorimetric_Reflectance" : "Spectrum_Reflectance";
        measurementSpec.appendChild(measurementType);

        const geometryChoice = xmlDoc.createElementNS(cc_ns, "cc:GeometryChoice");
        measurementSpec.appendChild(geometryChoice);

        const singleAngle = xmlDoc.createElementNS(cc_ns, "cc:SingleAngle");
        geometryChoice.appendChild(singleAngle);

        const singleAngleConfig = xmlDoc.createElementNS(cc_ns, "cc:SingleAngleConfiguration");
        singleAngleConfig.textContent = "Annular";
        singleAngle.appendChild(singleAngleConfig);

        const illuminationAngle = xmlDoc.createElementNS(cc_ns, "cc:IlluminationAngle");
        illuminationAngle.textContent = "45";
        singleAngle.appendChild(illuminationAngle);

        const measurementAngle = xmlDoc.createElementNS(cc_ns, "cc:MeasurementAngle");
        measurementAngle.textContent = "0.0";
        singleAngle.appendChild(measurementAngle);

        const wavelengthRange = xmlDoc.createElementNS(cc_ns, "cc:WavelengthRange");
        wavelengthRange.setAttribute("StartWL", "400");
        wavelengthRange.setAttribute("Increment", "10");
        measurementSpec.appendChild(wavelengthRange);

        if (idx === 0) {
            const calibrationStandard = xmlDoc.createElementNS(cc_ns, "cc:CalibrationStandard");
            measurementSpec.appendChild(calibrationStandard);

            const aperture = xmlDoc.createElementNS(cc_ns, "cc:Aperture");
            aperture.textContent = "SAV";
            measurementSpec.appendChild(aperture);

            const device = xmlDoc.createElementNS(cc_ns, "cc:Device");
            measurementSpec.appendChild(device);

            const model = xmlDoc.createElementNS(cc_ns, "cc:Model");
            device.appendChild(model);

            const deviceFilter = xmlDoc.createElementNS(cc_ns, "cc:DeviceFilter");
            deviceFilter.textContent = "Filter_None";
            device.appendChild(deviceFilter);

            const devicePolarization = xmlDoc.createElementNS(cc_ns, "cc:DevicePolarization");
            devicePolarization.textContent = "false";
            device.appendChild(devicePolarization);
        } else {
            const calibrationStandard = xmlDoc.createElementNS(cc_ns, "cc:CalibrationStandard");
            calibrationStandard.textContent = "XRGA";
            measurementSpec.appendChild(calibrationStandard);

            const aperture = xmlDoc.createElementNS(cc_ns, "cc:Aperture");
            aperture.textContent = "SAV";
            measurementSpec.appendChild(aperture);

            const device = xmlDoc.createElementNS(cc_ns, "cc:Device");
            measurementSpec.appendChild(device);

            const model = xmlDoc.createElementNS(cc_ns, "cc:Model");
            model.textContent = "eXact";
            device.appendChild(model);

            const deviceFilter = xmlDoc.createElementNS(cc_ns, "cc:DeviceFilter");
            deviceFilter.textContent = "Filter_None";
            device.appendChild(deviceFilter);

            const devicePolarization = xmlDoc.createElementNS(cc_ns, "cc:DevicePolarization");
            devicePolarization.textContent = "false";
            device.appendChild(devicePolarization);
        }
    }

    const customResources = xmlDoc.createElementNS(cc_ns, "cc:CustomResources");
    root.appendChild(customResources);

    const exactTolerancing = xmlDoc.createElementNS(et_ns, "et:eXactTolerancing");
    exactTolerancing.setAttribute("Name", "TESTE");
    customResources.appendChild(exactTolerancing);

    jsonData.forEach((color, idx) => {
        const qcSet = xmlDoc.createElementNS(et_ns, "et:QCSet");
        qcSet.setAttribute("Name", color.name);
        qcSet.setAttribute("StandardRef", `R${idx}`);
        exactTolerancing.appendChild(qcSet);

        const toleranceSet = xmlDoc.createElementNS(et_ns, "et:ToleranceSet");
        toleranceSet.setAttribute("ColorSpecification", `CSM0D502-${idx + 2}`);
        qcSet.appendChild(toleranceSet);

        const cielabTolerances = xmlDoc.createElementNS(et_ns, "et:CIELabTolerances");
        toleranceSet.appendChild(cielabTolerances);

        const de2000Tol = xmlDoc.createElementNS(et_ns, "et:dE2000Tol");
        cielabTolerances.appendChild(de2000Tol);

        const dE = xmlDoc.createElementNS(et_ns, "et:dE");
        dE.textContent = "2";
        de2000Tol.appendChild(dE);

        const kL = xmlDoc.createElementNS(et_ns, "et:kL");
        kL.textContent = "1";
        de2000Tol.appendChild(kL);

        const kC = xmlDoc.createElementNS(et_ns, "et:kC");
        kC.textContent = "1";
        de2000Tol.appendChild(kC);

        const kH = xmlDoc.createElementNS(et_ns, "et:kH");
        kH.textContent = "1";
        de2000Tol.appendChild(kH);
    });

    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(xmlDoc);

    document.getElementById('xmlOutput').textContent = formatXml(xmlString);
    window.generatedXmlString = xmlString;
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatXml(xml) {
    const PADDING = ' '.repeat(4);
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    xml = xml.replace(reg, '$1\r\n$2$3');
    return xml.split('\r\n').map((line) => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (line.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        pad += indent;
        return PADDING.repeat(pad - indent) + line;
    }).join('\r\n');
}

function downloadCxf() {
    const blob = new Blob([window.generatedXmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.cxf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
