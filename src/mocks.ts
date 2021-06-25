/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

export class MockResponse {
    url: string;
    body: string;
    status: number;

    constructor(url="/", body="test body",status=200) {
        this.url = url;
        this.body = body;
        this.status = status;
    }

    async text(): Promise<string> {
      return this.body;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async json(): Promise<any> {
       return JSON.parse(this.body);
    }

}


export class MockFetch {
    response: MockResponse;
    throwException: boolean;
    errorMsg: string;
    numCalls: number;
    fetch: (url:string) => Promise<MockResponse>;

    constructor(body="test body",status=200,throwException=false,errorMsg="default error") {
       this.response = new MockResponse("/", body, status);
       this.throwException = throwException;
       this.errorMsg = errorMsg;
       this.numCalls = 0;

       this.fetch = async (url:string): Promise<MockResponse> => {
          this.numCalls++;
          if(this.throwException) {
              throw new Error(this.errorMsg + " " + url);
          }

          return this.response;
       }
    }


}
