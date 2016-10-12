
$(function() {
    $('#submit-test').on('click', function(e) {
        e.preventDefault();
        if ($('#server').val().length == 0) return;
        if ($('#client').val().length == 0) return;        

        $(this).prop("disabled", true);
        $('#server').prop("disabled", true);
        $('#client').prop("disabled", true);
        $(this).html('<div class="loading"></div>');
        
        $.ajax({
            url: '/cgi-bin/iperfspeed',
            type: "POST",
            cache: false,
            timeout: 60000,
            data:
            {
                action: 'run_test',
                server: $('#server').val(),
                client: $('#client').val()
            },
            dataType: "text",
            context: this,
            success: function(data, textStatus, jqXHR)
            {
                console.log(data);
                $('#test-result').html('<pre>' + data + '</pre>');
                load_tests();
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                             
            },
            complete: function(jqXHR, textStatus) {
                $(this).prop("disabled", false);
                $('#server').prop("disabled", false);
                $('#client').prop("disabled", false);
                $(this).html('Run Test');
            }
        });
    });

    load_tests();
});

function load_tests() {
    $.ajax({
        url: '/cgi-bin/iperfspeed?action=previous_tests',
        type: "GET",
        dataType: "json",
        context: this,
        cache: false,
        success: function(data, textStatus, jqXHR)
        {            
            if (data == null) return;
            console.log(data);
            process_tests(data);
        },
        complete: function(jqXHR, textStatus) {
            //console.log( "messages complete" );
            //messages_updating = false;
        }
    });
}

function process_tests(data) {
    var html = '';    

    for (var i = 0; i < data.length; i++) {
        var row = '';        
        var date = new Date(0);
        date.setUTCSeconds(data[i].epoch);        

        var formated_date = format_date(date);        

        row += '<tr>';
        row += '<td>' + formated_date + '</td>';
        row += '<td>' + data[i].server + '</td>';
        row += '<td>' + data[i].client + '</td>';
        row += '<td>' + data[i].result + '</td>';
        row += '<td><button class="button-primary retest-button">Re-Test</button></td>';
        row += '</tr>';

        html += row;
    }

    $('#tests-table').html(html);

    $('.retest-button').on('click', function(e) {
        e.preventDefault();
        
        //var row = $(this).closest('tr').get(0);
        var row = $(this).closest('tr');
        //var cell = $(row).children().get(1);
        var server = $(row).children().eq(1).text();
        var client = $(row).children().eq(2).text();
        console.log(server);
        console.log(client);

        $('#server').val(server);
        $('#client').val(client);
        $('#submit-test').trigger('click');
    });
}

function epoch() {
    return Math.floor(new Date() / 1000);
}

function format_date(date) {
    var string;
    
    var year = String(date.getFullYear());

    string = (date.getMonth()+1) + '/' + date.getDate() + '/' + year.slice(-2);
    string += ' ';

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    string += hours + ':' + minutes + ' ' + ampm;

    return string;
}
