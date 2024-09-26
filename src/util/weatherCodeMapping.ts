const weatherCodeMapping = {
    "sunnyClear": [1000],
    "cloudyOvercast": [1003, 1006, 1009],
    "mistFog": [1030, 1135, 1147],
    "rainy": [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1201, 1240, 1243, 1246, 1273, 1276, 1171, 1198],
    "snowy": [1066, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282, 1168],
    "thunderExtreme": [1087]
};

export const nameForCode = (code: number) => {
    for (const [name, codes ] of Object.entries(weatherCodeMapping)) {
        if (codes.includes(code)) {
            return name;
        }
    }
    return "unknown";
}
