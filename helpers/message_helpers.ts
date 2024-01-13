export async function getMessageDetails(context, message) {
  let message_url =
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/" +
    message.id +
    "?format=metadata";
  let message_response = await context.fetcher.fetch({
    url: message_url,
    method: "GET",
  });
  return message_response.body;
}

export function elapsed_time(start, comment) {
  var precision = 3; // 3 decimal places
  var elapsed = process.hrtime(start)[1] / 1000000;
  console.log(
    process.hrtime(start)[0] +
      " s, " +
      elapsed.toFixed(precision) +
      " ms - " +
      comment
  ); // print message + time
}
