import {JwtDataShape, JwtData} from "../../src/utils/DecodedProfile";

import {format} from 'date-fns';

describe("DecodedProfile", () => {
  it("should take information from a json object and present it nicely", () => {
    const rawdata = {
      aud: "https://someservice.corp.int/callback",
      iss: "http://authserver.corp.int/adfs/services/trust",
      iat: 1589713614,
      exp: 1589717214,
      sub: "jan_kowalski@corp.int",
      email: "jan.kowalski@corp.com",
      first_name: "Jan",
      family_name: "Kowalski",
      username: "jan_kowalski",
      location: "Stuck at home",
      job_title: "Something boring",
      authmethod:
        "http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows",
      auth_time: "2020-05-17T09:39:51.023Z",
      ver: "1.0",
      appid: "4BEDDDD2-BE69-4792-9C91-5708C43566D6",
    };

    const prof = JwtData(rawdata as JwtDataShape);

    expect(prof.aud).toEqual("https://someservice.corp.int/callback");
    expect(prof.iss).toEqual("http://authserver.corp.int/adfs/services/trust");

    expect(prof.iat_moment ? format(prof.iat_moment, "yyyy-MM-dd HH:mm:ss") : "").toEqual(
      "2020-05-17 11:06:54"
    );
    expect(prof.exp).toEqual(1589717214);
    expect(prof.exp_moment ? format(prof.exp_moment,"yyyy-MM-dd HH:mm:ss") : "").toEqual(
      "2020-05-17 12:06:54"
    );
    expect(prof.sub).toEqual("jan_kowalski@corp.int");
    expect(prof.email).toEqual("jan.kowalski@corp.com");
    expect(prof.first_name).toEqual("Jan");
    expect(prof.family_name).toEqual("Kowalski");
    expect(prof.username).toEqual("jan_kowalski");
    expect(prof.location).toEqual("Stuck at home");
    expect(prof.job_title).toEqual("Something boring");
  });
});
